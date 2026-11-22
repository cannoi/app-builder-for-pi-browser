import { useState } from 'react'
import { authenticate, createPayment, type PiUser } from './pi'

export default function App() {
  const [user, setUser] = useState<PiUser | null>(null)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin() {
    setBusy(true)
    setError('')
    setStatus('Opening Pi Authentication…')
    try {
      const u = await authenticate(['username', 'payments'])
      setUser(u)
      setStatus(`Signed in as @${u.username}`)
      // TODO: send u.accessToken to your backend → GET /v2/me → create session
    } catch (e: any) {
      setError(e?.message || 'Login cancelled or failed')
      setStatus('Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function handlePay() {
    if (!user) return
    setBusy(true)
    setError('')
    setStatus('Creating payment…')
    try {
      createPayment(
        { amount: 1, memo: 'Demo payment for {{APP_NAME}}', metadata: { productId: 'demo-1' } },
        {
          onReadyForServerApproval: async (paymentId) => {
            setStatus(`Approving ${paymentId}…`)
            // Call your backend: POST /api/payments/approve { paymentId }
            await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId })
            })
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            setStatus(`Completing ${paymentId}…`)
            // Call your backend: POST /api/payments/complete { paymentId, txid }
            await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId, txid })
            })
            setStatus('Payment completed')
          },
          onCancel: () => setStatus('Payment cancelled'),
          onError: (err) => {
            setError(err?.message || 'Payment error')
            setStatus('Payment failed')
          }
        }
      )
    } catch (e: any) {
      setError(e?.message || 'Payment failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <h1>{{APP_NAME}}</h1>
      <p>{{APP_SUMMARY}}</p>

      {!user ? (
        <button disabled={busy} onClick={handleLogin}>Sign in with Pi</button>
      ) : (
        <>
          <p className="ok">Welcome, @{user.username}</p>
          <button disabled={busy} onClick={handlePay}>Pay 1 Test-Pi (demo)</button>
        </>
      )}

      <div className="status">{status}</div>
      {error && <div className="status error">{error}</div>}
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 20 }}>
        Test Authentication & Payments only inside <strong>Pi Sandbox</strong> / external browser.
        Container preview cannot complete real Pi Login.
      </p>
    </div>
  )
}
