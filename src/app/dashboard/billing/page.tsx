import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BillingClient } from '@/components/billing-client'

export default async function BillingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login?redirect=/dashboard/billing')
  }

  // Get all user's clubs (any role can purchase boosts)
  const memberships = await prisma.membership.findMany({
    where: { 
      userId: session.user.id,
    },
    include: {
      club: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const clubs = memberships.map(m => m.club)

  return (
    <BillingClient 
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email || '',
        image: session.user.image,
      }}
      clubs={clubs}
    />
  )
}
