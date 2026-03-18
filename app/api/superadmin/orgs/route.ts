import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  const user = await getAppUser()
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { users: true } } },
  })
  return NextResponse.json(orgs)
}

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user || user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, slug, adminEmail, adminPassword } = await req.json()

  if (!name || !slug || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must be lowercase letters, numbers, and hyphens only.' }, { status: 400 })
  }

  const existing = await prisma.organization.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'That URL slug is already taken.' }, { status: 409 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existingUser) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })
  }

  const supabaseAdmin = createAdminClient()

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const org = await prisma.$transaction(async (tx) => {
    const newOrg = await tx.organization.create({
      data: { name, slug },
    })
    await tx.user.create({
      data: {
        id: authData.user.id,
        email: adminEmail,
        name: `${name} Admin`,
        role: 'ORG_ADMIN',
        orgId: newOrg.id,
      },
    })
    return newOrg
  })

  return NextResponse.json(org, { status: 201 })
}
