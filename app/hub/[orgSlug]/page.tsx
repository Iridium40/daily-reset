// app/hub/[orgSlug]/page.tsx
// This is the public client-facing hub.
// No login required — just visit /hub/[orgSlug]

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import HubClient from '@/components/HubClient'

interface Props {
  params: { orgSlug: string }
}

export async function generateMetadata({ params }: Props) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
    select: { name: true },
  })
  return {
    title: org ? `${org.name} — Client Hub` : 'Client Hub',
  }
}

export default async function HubPage({ params }: Props) {
  const org = await prisma.organization.findUnique({
    where: { slug: params.orgSlug },
  })

  if (!org) notFound()

  return <HubClient org={org} />
}
