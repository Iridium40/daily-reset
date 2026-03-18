import { createClient } from '@/lib/supabase/server'
import { prisma } from './db'

export type AppUser = {
  id: string
  email: string
  name: string | null
  role: 'SUPER_ADMIN' | 'ORG_ADMIN'
  orgId: string | null
  orgSlug: string | null
}

export async function getAppUser(): Promise<AppUser | null> {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { organization: { select: { slug: true } } },
  })
  if (!dbUser) return null

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as 'SUPER_ADMIN' | 'ORG_ADMIN',
    orgId: dbUser.orgId,
    orgSlug: dbUser.organization?.slug ?? null,
  }
}
