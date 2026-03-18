import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token, name, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Token and password required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const invite = await prisma.coachInvite.findUnique({
    where: { token },
    include: { organization: true },
  })

  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired invite.' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email: invite.email } })
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id:    authData.user.id,
        email: invite.email,
        name:  name || invite.email,
        role:  'ORG_ADMIN',
        orgId: invite.orgId,
      },
    }),
    prisma.coachInvite.update({
      where: { id: invite.id },
      data:  { acceptedAt: new Date() },
    }),
  ])

  return NextResponse.json({
    ok:      true,
    orgSlug: invite.organization.slug,
    email:   invite.email,
  })
}
