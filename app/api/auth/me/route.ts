import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('[/api/auth/me] Supabase auth error:', authError.message)
      return NextResponse.json({ error: 'Auth error' }, { status: 401 })
    }
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { organization: { select: { slug: true } } },
    })

    if (!dbUser) {
      console.error('[/api/auth/me] Auth user found but no DB record for id:', authUser.id)
      return NextResponse.json({ error: 'User profile not found in database' }, { status: 404 })
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      orgId: dbUser.orgId,
      orgSlug: dbUser.organization?.slug ?? null,
    })
  } catch (e: any) {
    console.error('[/api/auth/me] Unhandled error:', e?.message || e)
    return NextResponse.json(
      { error: 'Internal server error', detail: e?.message || 'Unknown' },
      { status: 500 },
    )
  }
}
