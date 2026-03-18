import { NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getAppUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    return NextResponse.json(user)
  } catch (e) {
    console.error('[/api/auth/me]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
