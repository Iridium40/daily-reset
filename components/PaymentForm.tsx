'use client'

import { useState, useEffect } from 'react'

type Props = {
  amountCents: number
  onSuccess: (paymentId: string) => void
  onError: (msg: string) => void
}

export default function PaymentForm({ amountCents, onSuccess, onError }: Props) {
  const [loading, setLoading] = useState(true)
  const [devMode, setDevMode] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountCents }),
    })
      .then(r => r.json())
      .then(data => {
        setClientSecret(data.clientSecret)
        setDevMode(data.devMode)
        setLoading(false)
      })
      .catch(() => {
        onError('Could not initialize payment')
        setLoading(false)
      })
  }, [amountCents])

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#7A6E5C', fontSize: 14 }}>Preparing payment...</div>
  }

  if (devMode) {
    return (
      <div style={{ border: '2px dashed #C45A1A', borderRadius: 12, padding: 20, background: '#FDF8F3' }}>
        <p style={{ fontWeight: 600, color: '#C45A1A', fontSize: 14, marginTop: 0 }}>Dev Mode — No real charges</p>
        <p style={{ fontSize: 13, color: '#7A6E5C', marginBottom: 16 }}>
          Stripe keys not configured. Donation: <strong>${(amountCents / 100).toFixed(2)}</strong>
        </p>
        <button
          disabled={processing}
          onClick={async () => {
            setProcessing(true)
            await new Promise(r => setTimeout(r, 800))
            onSuccess('dev_payment_' + Date.now())
          }}
          style={{
            width: '100%',
            background: '#C45A1A',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: 8,
            border: 'none',
            cursor: processing ? 'not-allowed' : 'pointer',
            opacity: processing ? 0.7 : 1,
          }}
        >
          {processing ? 'Processing...' : `Donate $${(amountCents / 100).toFixed(2)} (Dev)`}
        </button>
      </div>
    )
  }

  return <StripeElements clientSecret={clientSecret} amountCents={amountCents} onSuccess={onSuccess} onError={onError} />
}

function StripeElements({ clientSecret, amountCents, onSuccess, onError }: { clientSecret: string; amountCents: number; onSuccess: (id: string) => void; onError: (msg: string) => void }) {
  const [StripeProvider, setStripeProvider] = useState<any>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      import('@stripe/stripe-js'),
      import('@stripe/react-stripe-js'),
    ]).then(([stripeJs, reactStripe]) => {
      const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      if (!pk) { onError('Stripe publishable key not set'); return }
      const promise = stripeJs.loadStripe(pk)
      setStripeProvider({ promise, Elements: reactStripe.Elements, PaymentElement: reactStripe.PaymentElement, useStripe: reactStripe.useStripe, useElements: reactStripe.useElements })
      setLoaded(true)
    })
  }, [])

  if (!loaded || !StripeProvider) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#7A6E5C' }}>Loading payment form...</div>
  }

  const { Elements, promise } = StripeProvider
  return (
    <Elements stripe={promise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
      <CheckoutInner amountCents={amountCents} onSuccess={onSuccess} onError={onError} provider={StripeProvider} />
    </Elements>
  )
}

function CheckoutInner({ amountCents, onSuccess, onError, provider }: { amountCents: number; onSuccess: (id: string) => void; onError: (msg: string) => void; provider: any }) {
  const stripe = provider.useStripe()
  const elements = provider.useElements()
  const [processing, setProcessing] = useState(false)
  const PaymentElement = provider.PaymentElement

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setProcessing(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message || 'Payment failed')
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else {
      onError('Unexpected payment status')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          width: '100%',
          marginTop: 16,
          background: '#C45A1A',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          padding: '12px 20px',
          borderRadius: 8,
          border: 'none',
          cursor: processing ? 'not-allowed' : 'pointer',
          opacity: processing ? 0.7 : 1,
        }}
      >
        {processing ? 'Processing...' : `Donate $${(amountCents / 100).toFixed(2)}`}
      </button>
    </form>
  )
}
