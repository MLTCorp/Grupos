import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { syncSubscription, createCustomerRecord } from '@/lib/subscription'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text() // MUST use text(), not json()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Log event for debugging
  console.log(`Stripe webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id

        if (userId && session.customer) {
          // Create customer record linking user to Stripe
          await createCustomerRecord(userId, session.customer as string)
        }

        // Subscription will be synced by customer.subscription.created event
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        // DEFERRED(BILL-07): Email notifications deferred to Phase 6 (Notifications)
        // When implemented: Send email "Seu trial expira em 3 dias" via Resend/SendGrid
        // For now, log for monitoring and manual follow-up
        console.log(`[BILL-07-DEFERRED] Trial ending soon for subscription: ${subscription.id}, user: ${subscription.metadata.user_id}`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // DEFERRED(BILL-07): Email notifications deferred to Phase 6 (Notifications)
        // When implemented: Send email "Falha no pagamento - atualize seu cartao" via Resend/SendGrid
        // For now, log for monitoring and manual follow-up
        console.log(`[BILL-07-DEFERRED] Payment failed for invoice: ${invoice.id}, customer: ${invoice.customer}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    // Return 200 to prevent Stripe from retrying
    // Log the error for monitoring
  }

  return NextResponse.json({ received: true })
}
