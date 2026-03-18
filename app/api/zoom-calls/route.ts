import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const orgSlug = req.nextUrl.searchParams.get('orgSlug')
  if (!orgSlug) return NextResponse.json({ error: 'orgSlug required' }, { status: 400 })

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const zoomCalls = await prisma.zoomCall.findMany({
    where: { orgId: org.id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(zoomCalls)
}

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { orgSlug, title, zoomLink, passcode, schedule, meetingId } = body
  if (!orgSlug || !title || !zoomLink) {
    return NextResponse.json({ error: 'orgSlug, title, and zoomLink are required' }, { status: 400 })
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isOrgAdmin = user.role === 'ORG_ADMIN' && user.orgSlug === orgSlug
  if (!isSuperAdmin && !isOrgAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const org = await prisma.organization.findUnique({ where: { slug: orgSlug }, select: { id: true } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const count = await prisma.zoomCall.count({ where: { orgId: org.id } })

  const zoomCall = await prisma.zoomCall.create({
    data: {
      orgId: org.id,
      title,
      zoomLink,
      passcode: passcode || null,
      schedule: schedule || null,
      meetingId: meetingId || null,
      sortOrder: count,
    },
  })
  return NextResponse.json(zoomCall)
}

export async function PATCH(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, orgSlug, title, zoomLink, passcode, schedule, meetingId } = body
  if (!id || !orgSlug) return NextResponse.json({ error: 'id and orgSlug required' }, { status: 400 })

  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isOrgAdmin = user.role === 'ORG_ADMIN' && user.orgSlug === orgSlug
  if (!isSuperAdmin && !isOrgAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const zoomCall = await prisma.zoomCall.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(zoomLink !== undefined && { zoomLink }),
      ...(passcode !== undefined && { passcode: passcode || null }),
      ...(schedule !== undefined && { schedule: schedule || null }),
      ...(meetingId !== undefined && { meetingId: meetingId || null }),
    },
  })
  return NextResponse.json(zoomCall)
}

export async function DELETE(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, orgSlug } = body
  if (!id || !orgSlug) return NextResponse.json({ error: 'id and orgSlug required' }, { status: 400 })

  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isOrgAdmin = user.role === 'ORG_ADMIN' && user.orgSlug === orgSlug
  if (!isSuperAdmin && !isOrgAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.zoomCall.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
