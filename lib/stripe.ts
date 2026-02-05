import Stripe from 'stripe'

/**
 * Lazy-loaded Stripe instance to avoid build-time errors
 * when environment variables are not available
 */
let stripeInstance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    // Initialize Stripe on first access
    if (!stripeInstance) {
      const apiKey = process.env.STRIPE_SECRET_KEY
      if (!apiKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set')
      }
      stripeInstance = new Stripe(apiKey, {
        apiVersion: '2026-01-28.clover',
        typescript: true,
      })
    }
    return stripeInstance[prop as keyof Stripe]
  },
})
