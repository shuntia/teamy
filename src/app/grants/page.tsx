import { PublicPageLayout } from '@/components/public-page-layout'
import { GrantFormContent } from '@/components/grant-form'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function GrantsPage() {
  const session = await getServerSession(authOptions)
  const isAuthenticated = !!session?.user

  return (
    <PublicPageLayout>
      <GrantFormContent isAuthenticated={isAuthenticated} />
    </PublicPageLayout>
  )
}
