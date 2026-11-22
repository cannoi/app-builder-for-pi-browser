/**
 * Official Pi SDK helpers for {{APP_NAME}}
 * Docs: https://developers.minepi.com/docs
 */

declare global {
  interface Window {
    Pi?: any
  }
}

export type PiUser = {
  uid: string
  username: string
  accessToken?: string
}

let initialized = false

/** Call once before any Pi SDK method. sandbox:true for development / Pi Sandbox. */
export function initPi(sandbox = true) {
  if (initialized) return
  if (!window.Pi) {
    throw new Error('Pi SDK not loaded. Ensure https://sdk.minepi.com/pi-sdk.js is included.')
  }
  window.Pi.init({ version: '2.0', sandbox })
  initialized = true
}

/**
 * Authenticate with Pi. Returns user + accessToken.
 * Always verify accessToken on your backend with GET /v2/me before trusting identity.
 */
export async function authenticate(scopes: string[] = ['username']): Promise<PiUser> {
  initPi(true)
  return new Promise((resolve, reject) => {
    window.Pi.authenticate(scopes, onIncompletePaymentFound)
      .then((auth: any) => {
        resolve({
          uid: auth.user.uid,
          username: auth.user.username,
          accessToken: auth.accessToken
        })
      })
      .catch(reject)
  })
}

/** Required callback for incomplete payments discovered at login time. */
function onIncompletePaymentFound(payment: any) {
  console.warn('Incomplete payment found', payment)
  // In production apps: call your backend to resume / complete the payment.
}

/**
 * Create a payment. Backend must approve then complete.
 * Never grant goods based only on frontend callbacks.
 */
export function createPayment(paymentData: {
  amount: number
  memo: string
  metadata?: Record<string, unknown>
}, callbacks: {
  onReadyForServerApproval: (paymentId: string) => void
  onReadyForServerCompletion: (paymentId: string, txid: string) => void
  onCancel?: (paymentId: string) => void
  onError?: (error: any, payment?: any) => void
}) {
  initPi(true)
  return window.Pi.createPayment(paymentData, callbacks)
}
