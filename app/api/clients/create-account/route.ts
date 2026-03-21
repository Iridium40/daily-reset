import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clientId, email, password } = body

  if (!clientId || !email || !password) {
    return NextResponse.json({ error: 'clientId, email, and password are required' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  if (client.supabaseUserId) return NextResponse.json({ error: 'Account already exists' }, { status: 409 })

  const supabase = createAdminClient()
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { supabaseUserId: authData.user.id },
  })

  return NextResponse.json({ ok: true, userId: authData.user.id })
}
