import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function main() {
  const email    = process.env.SUPER_ADMIN_EMAIL || 'admin@thedailyreset.com'
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('✓ Super admin already exists:', email)
    return
  }

  // Create the auth user in Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error('Failed to create Supabase auth user:', authError.message)
    process.exit(1)
  }

  // Create the app user record linked to the Supabase auth UUID
  await prisma.user.create({
    data: {
      id: authData.user.id,
      email,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      orgId: null,
    },
  })

  console.log('✅ Super admin created:', email)
  console.log('   Supabase Auth ID:', authData.user.id)
  console.log('   ⚠️  Change this password immediately after first login!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
