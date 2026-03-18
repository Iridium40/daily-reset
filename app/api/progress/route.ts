// app/api/progress/route.ts
// Saves and loads checklist progress for anonymous clients.
// Each client gets a UUID (stored in their localStorage) as their identifier.
// No login required — just an anonymous token tied to an org.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/progress?clientToken=xxx&orgId=xxx&listKey=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clientToken = searchParams.get('clientToken')
  const orgId       = searchParams.get('orgId')
  const listKey     = searchParams.get('listKey')

  if (!clientToken || !orgId || !listKey) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const record = await prisma.checklistProgress.findUnique({
    where: { clientToken_orgId_listKey: { clientToken, orgId, listKey } },
  })

  return NextResponse.json({ checked: record ? JSON.parse(record.checkedJson) : null })
}

// POST /api/progress
// Body: { clientToken, orgId, listKey, checked: boolean[] }
export async function POST(req: NextRequest) {
  const { clientToken, orgId, listKey, checked } = await req.json()

  if (!clientToken || !orgId || !listKey || !Array.isArray(checked)) {
    return NextResponse.json({ error: 'Missing or invalid params' }, { status: 400 })
  }

  // Verify org exists
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { id: true } })
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const record = await prisma.checklistProgress.upsert({
    where:  { clientToken_orgId_listKey: { clientToken, orgId, listKey } },
    update: { checkedJson: JSON.stringify(checked) },
    create: { clientToken, orgId, listKey, checkedJson: JSON.stringify(checked) },
  })

  return NextResponse.json({ success: true, record })
}
