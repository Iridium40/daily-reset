// app/api/checklist/route.ts
// GET  ?orgId=&clientToken=&listKey=   → returns saved boolean array
// POST { orgId, clientToken, listKey, checked: boolean[] } → upserts progress

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orgId       = searchParams.get('orgId')
  const clientToken = searchParams.get('clientToken')
  const listKey     = searchParams.get('listKey')

  if (!orgId || !clientToken || !listKey) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const row = await prisma.checklistProgress.findUnique({
    where: { clientToken_orgId_listKey: { clientToken, orgId, listKey } },
  })

  return NextResponse.json({
    checked: row ? JSON.parse(row.checkedJson) : null,
  })
}

export async function POST(req: NextRequest) {
  const { orgId, clientToken, listKey, checked } = await req.json()

  if (!orgId || !clientToken || !listKey || !Array.isArray(checked)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await prisma.checklistProgress.upsert({
    where:  { clientToken_orgId_listKey: { clientToken, orgId, listKey } },
    create: { clientToken, orgId, listKey, checkedJson: JSON.stringify(checked) },
    update: { checkedJson: JSON.stringify(checked) },
  })

  return NextResponse.json({ ok: true })
}
