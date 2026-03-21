import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendHipaaIntakeEmail } from '@/lib/email/hipaa'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientId } = body
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 })

  const intake = await prisma.hipaaIntake.findUnique({
    where: { clientId },
    include: { client: { select: { name: true, email: true } } },
  })
  if (!intake) return NextResponse.json({ error: 'No intake record found' }, { status: 404 })

  await sendHipaaIntakeEmail({
    to: intake.client.email,
    clientName: intake.client.name,
    token: intake.token,
  })

  return NextResponse.json({ ok: true })
}
