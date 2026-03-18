import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: {
      id: true, slug: true, name: true, logoUrl: true,
      primaryColor: true, accentColor: true, welcomeMessage: true,
      zoomLink: true, zoomSchedule: true, zoomMeetingId: true, zoomRecordingsUrl: true, facebookUrl: true,
    },
  })
  if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  return NextResponse.json(org)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isOrgAdmin   = user.role === 'ORG_ADMIN' && user.orgSlug === params.orgSlug
  if (!isSuperAdmin && !isOrgAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body    = await req.json()
  const allowed = ['name','logoUrl','primaryColor','accentColor','welcomeMessage','zoomLink','zoomSchedule','zoomMeetingId','zoomRecordingsUrl','facebookUrl']
  const data    = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))

  const updated = await prisma.organization.update({ where: { slug: params.orgSlug }, data })
  return NextResponse.json(updated)
}
