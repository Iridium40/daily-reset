// app/api/invite/validate/route.ts
// GET ?token=   → returns { orgName, email } or { error }

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const invite = await prisma.coachInvite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  })

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 400 })
  }

  return NextResponse.json({
    orgName: invite.organization.name,
    email:   invite.email,
  })
}
