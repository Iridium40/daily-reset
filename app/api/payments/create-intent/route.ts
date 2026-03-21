import { NextRequest, NextResponse } from 'next/server'

const DEV_MODE = !process.env.STRIPE_SECRET_KEY

let _stripe: any = null
async function getStripe() {
  if (DEV_MODE) return null
  if (!_stripe) {
    const Stripe = (await import('stripe')).default
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' as any })
  }
  return _stripe
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { amountCents } = body

  const amount = Math.max(1000, Math.round(Number(amountCents) || 1000))

  if (DEV_MODE) {
    return NextResponse.json({
      clientSecret: 'dev_mock_secret_' + Date.now(),
      devMode: true,
      amount,
    })
  }

  const stripe = await getStripe()
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { source: 'daily-reset-booking' },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    devMode: false,
    amount,
  })
}
