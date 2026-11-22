/**
 * Phase 4 — Official Pi Developer MCP client
 *
 * Endpoint: https://developers.minepi.com/mcp
 * Onboarding: https://developers.minepi.com/agents.md
 *
 * Design rules:
 * - Discover tools dynamically; never invent tool names.
 * - Do NOT store Pi credentials or access tokens.
 * - Sensitive actions require explicit developer approval (approval gate).
 * - Container cannot complete Pi sign-in; user must authorize in browser when prompted.
 * - Graceful degradation when MCP is unreachable or unauthorized.
 */

const DEFAULT_MCP_URL = 'https://developers.minepi.com/mcp';
const AGENTS_MD_URL = 'https://developers.minepi.com/agents.md';

/** Actions that must never run without explicit user approval */
export const SENSITIVE_TOOLS = new Set([
  'create_app',
  'update_app',
  'verify_app_url_ownership',
  'prepare_app_logo_upload',
  'set_app_logo',
  'prompt_payments',
  'terms_accept',
  'logout'
]);

/** Known tool names from official agents.md (used only as documentation hints, not as hard-coded inventory) */
export const DOCUMENTED_TOOLS = [
  'whoami',
  'terms_accept',
  'create_app',
  'list_apps',
  'get_app',
  'update_app',
  'verify_app_url_ownership',
  'prepare_app_logo_upload',
  'set_app_logo',
  'prompt_payments',
  'logout'
];

export function createPiMcpClient(options = {}) {
  const mcpUrl = (options.mcpUrl || process.env.PI_MCP_URL || DEFAULT_MCP_URL).replace(/\/$/, '');
  const state = {
    mcpUrl,
    lastDiscovery: null,
    tools: [],
    connected: false,
    error: null,
    sessionHint: null
  };

  async function fetchAgentsMd() {
    try {
      const res = await fetch(AGENTS_MD_URL, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) return { ok: false, status: res.status, text: null };
      const text = await res.text();
      return { ok: true, status: res.status, text };
    } catch (e) {
      return { ok: false, status: 0, text: null, error: e.message };
    }
  }

  /**
   * Lightweight connectivity + capability probe.
   * Real MCP sessions usually require an MCP-compatible host (Cursor/Claude/Codex)
   * and user Pi sign-in. This client reports what is reachable from the Builder runtime.
   */
  async function probe() {
    const result = {
      mcpUrl,
      reachable: false,
      status: null,
      contentType: null,
      toolsDiscovered: [],
      documentedTools: DOCUMENTED_TOOLS,
      agentsMd: null,
      note: 'Full tool execution requires an MCP-capable coding agent with Pi user authorization. Builder provides discovery, planning, and approval gates.',
      error: null
    };

    try {
      const res = await fetch(mcpUrl, {
        method: 'GET',
        headers: { Accept: 'text/event-stream, application/json, */*' },
        signal: AbortSignal.timeout(12000)
      });
      result.status = res.status;
      result.contentType = res.headers.get('content-type');
      result.reachable = res.status > 0 && res.status < 500;

      // Some MCP servers answer JSON on GET/initialize; tolerate non-JSON bodies.
      const bodyText = await res.text().catch(() => '');
      if (bodyText) {
        try {
          const json = JSON.parse(bodyText);
          if (Array.isArray(json.tools)) {
            result.toolsDiscovered = json.tools.map(t => t.name || t);
          } else if (json.result?.tools) {
            result.toolsDiscovered = json.result.tools.map(t => t.name || t);
          }
        } catch {
          // SSE or HTML — still counts as reachable endpoint
        }
      }
    } catch (e) {
      result.error = e.message;
      result.reachable = false;
    }

    const md = await fetchAgentsMd();
    result.agentsMd = {
      ok: md.ok,
      status: md.status,
      hasCreateApp: !!(md.text && md.text.includes('create_app')),
      hasListApps: !!(md.text && md.text.includes('list_apps')),
      snippet: md.text ? md.text.slice(0, 400) : null
    };

    state.connected = result.reachable;
    state.lastDiscovery = new Date().toISOString();
    state.tools = result.toolsDiscovered.length ? result.toolsDiscovered : DOCUMENTED_TOOLS;
    state.error = result.error;

    return result;
  }

  function listKnownTools() {
    return {
      source: state.tools.length && state.tools !== DOCUMENTED_TOOLS ? 'discovered' : 'documented',
      tools: state.tools.length ? state.tools : DOCUMENTED_TOOLS,
      sensitive: [...SENSITIVE_TOOLS],
      mcpUrl
    };
  }

  /**
   * Build an integration plan without executing anything.
   */
  function planIntegration(projectMeta = {}) {
    const steps = [
      { id: 'probe', title: 'Probe MCP endpoint & agents.md', requiresApproval: false },
      { id: 'whoami', title: 'Check Pi developer identity (whoami)', requiresApproval: false },
      { id: 'terms', title: 'Accept terms if required', requiresApproval: true, tool: 'terms_accept' },
      { id: 'network', title: 'Choose Staging (Testnet) or Production (Mainnet)', requiresApproval: true },
      { id: 'create_or_select', title: 'create_app or list_apps + select', requiresApproval: true, tool: 'create_app' },
      { id: 'dev_url', title: 'Set development_url for Sandbox testing', requiresApproval: true, tool: 'update_app' },
      { id: 'sandbox_test', title: 'Open sandbox_url in external browser / Pi Sandbox', requiresApproval: false },
      { id: 'frontend_url', title: 'Set frontend_url (public HTTPS) after deploy', requiresApproval: true, tool: 'update_app' },
      { id: 'verify', title: 'verify_app_url_ownership', requiresApproval: true, tool: 'verify_app_url_ownership' },
      { id: 'payments', title: 'Optional: prompt_payments setup', requiresApproval: true, tool: 'prompt_payments' },
      { id: 'logo', title: 'Optional: prepare + set app logo', requiresApproval: true, tool: 'set_app_logo' },
      { id: 'listing', title: 'Production only: open listing_url for Ecosystem review', requiresApproval: true }
    ];

    return {
      project: projectMeta,
      mcpUrl,
      steps,
      warnings: [
        'Never store Pi credentials or access tokens in Builder.',
        'User must complete Pi sign-in / authorization in their coding agent or browser.',
        'Do not switch Staging ↔ Production silently; network is fixed per app.',
        'Container preview is not Pi Sandbox — real auth/payment tests need external browser.'
      ]
    };
  }

  /**
   * Approval gate helper. Sensitive tools must pass through this.
   */
  function requiresApproval(toolName) {
    return SENSITIVE_TOOLS.has(toolName);
  }

  /**
   * Record a pending MCP action for user approval (persisted by caller).
   */
  function buildApprovalRequest(toolName, args = {}, reason = '') {
    if (!toolName) throw new Error('toolName required');
    return {
      id: `mcp-approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tool: toolName,
      args,
      reason: reason || `Execute MCP tool: ${toolName}`,
      sensitive: requiresApproval(toolName),
      status: 'pending',
      createdAt: new Date().toISOString(),
      mcpUrl
    };
  }

  /**
   * Describe how a host coding agent should attach this MCP server.
   * Builder itself does not pretend to be a full MCP host.
   */
  function hostConfigSnippet() {
    return {
      mcpServers: {
        'pi-developers': {
          url: mcpUrl
        }
      },
      instructions: [
        'Add the remote MCP server above to your coding agent (Cursor / Claude Code / Codex / compatible host).',
        'Open a project and ask the agent to follow https://developers.minepi.com/agents.md',
        'Complete Pi sign-in when the agent prompts for authorization.',
        'Use Builder approval gates before allowing create_app / update_app / verify / payments / logo actions.'
      ],
      agentsMd: AGENTS_MD_URL
    };
  }

  /**
   * Simulate / dry-run tool call metadata for planning UIs.
   * Does not perform privileged side effects.
   */
  function describeToolCall(toolName, args = {}) {
    return {
      tool: toolName,
      args,
      sensitive: requiresApproval(toolName),
      documented: DOCUMENTED_TOOLS.includes(toolName),
      approvalRequired: requiresApproval(toolName),
      execution: 'Requires MCP host + Pi user authorization. Builder records intent and approval only.',
      agentsMdRef: AGENTS_MD_URL
    };
  }

  return {
    mcpUrl,
    probe,
    listKnownTools,
    planIntegration,
    requiresApproval,
    buildApprovalRequest,
    hostConfigSnippet,
    describeToolCall,
    fetchAgentsMd,
    getState: () => ({ ...state })
  };
}

export default createPiMcpClient;
