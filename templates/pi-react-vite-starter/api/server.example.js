/**
 * Example backend for Pi Authentication + Payments
 * Place this behind your real server (Express, Fastify, etc.)
 *
 * Required env:
 *   PI_API_KEY=...          (Server API Key from Pi Developers — NEVER expose to frontend)
 *   PI_API_BASE=https://api.minepi.com  (or sandbox endpoint per current docs)
 */

// Pseudocode — adapt to your framework

async function verifyUser(accessToken) {
  const res = await fetch(`${process.env.PI_API_BASE}/v2/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  if (!res.ok) throw new Error('Invalid Pi access token')
  return res.json() // { uid, username, ... }
}

async function approvePayment(paymentId) {
  const res = await fetch(`${process.env.PI_API_BASE}/v2/payments/${paymentId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Key ${process.env.PI_API_KEY}` }
  })
  if (!res.ok) throw new Error('Approve failed')
  return res.json()
}

async function completePayment(paymentId, txid) {
  const res = await fetch(`${process.env.PI_API_BASE}/v2/payments/${paymentId}/complete`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${process.env.PI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ txid })
  })
  if (!res.ok) throw new Error('Complete failed')
  return res.json()
}

// Routes you must implement:
// POST /api/auth/session   { accessToken } → verifyUser → create app session cookie/JWT
// POST /api/payments/approve  { paymentId }
// POST /api/payments/complete { paymentId, txid }
// Always check idempotency on complete.

export { verifyUser, approvePayment, completePayment }
