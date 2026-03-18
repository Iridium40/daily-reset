import { NextRequest, NextResponse } from 'next/server'
import { getAppUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { prisma } from '@/lib/db'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MAX_SIZE_MB   = 2

export async function POST(req: NextRequest) {
  const user = await getAppUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file') as File | null
  const orgSlug  = formData.get('orgSlug') as string | null

  if (!file || !orgSlug) {
    return NextResponse.json({ error: 'file and orgSlug are required' }, { status: 400 })
  }

  const isSuperAdmin = user.role === 'SUPER_ADMIN'
  const isOrgAdmin   = user.role === 'ORG_ADMIN' && user.orgSlug === orgSlug
  if (!isSuperAdmin && !isOrgAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only PNG, JPEG, WebP, and SVG are allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `File must be under ${MAX_SIZE_MB}MB` }, { status: 400 })
  }

  const ext    = file.name.split('.').pop() || 'png'
  const path   = `${orgSlug}/logo-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)

  await prisma.organization.update({
    where: { slug: orgSlug },
    data:  { logoUrl: publicUrl },
  })

  return NextResponse.json({ logoUrl: publicUrl })
}
