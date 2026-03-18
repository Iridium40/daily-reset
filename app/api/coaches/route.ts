import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { sendCoachInviteEmail } from '@/lib/email'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  const user = await getAppUser()
  if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const orgSlug = new URL(req.url).searchParams.get('orgSlug')
  if (!orgSlug) return NextResponse.json({ error: 'orgSlug required' }, { status: 400 })
  if (user.role === 'ORG_ADMIN' && user.orgSlug !== orgSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } })
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [coaches, invites] = await Promise.all([
    prisma.user.findMany({
      where: { orgId: org.id, role: 'ORG_ADMIN' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.coachInvite.findMany({
      where: { orgId: org.id, acceptedAt: null },
      select: { id: true, email: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return NextResponse.json({ coaches, invites })
}

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email, orgSlug } = await req.json()
  if (!email || !orgSlug) return NextResponse.json({ error: 'email and orgSlug required' }, { status: 400 })
  if (user.role === 'ORG_ADMIN' && user.orgSlug !== orgSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 })

  await prisma.coachInvite.deleteMany({ where: { orgId: org.id, email, acceptedAt: null } })

  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await prisma.coachInvite.create({
    data: { orgId: org.id, email, token, expiresAt },
  })

  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('.supabase.co', '') || 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/invite?token=${token}`

  await sendCoachInviteEmail({
    to:        email,
    inviteUrl,
    orgName:   org.name,
    invitedBy: user.name || user.email,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getAppUser()
  if (!user || !['SUPER_ADMIN', 'ORG_ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inviteId, orgSlug } = await req.json()
  if (!inviteId || !orgSlug) return NextResponse.json({ error: 'inviteId and orgSlug required' }, { status: 400 })
  if (user.role === 'ORG_ADMIN' && user.orgSlug !== orgSlug) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.coachInvite.delete({ where: { id: inviteId } })
  return NextResponse.json({ ok: true })
}
