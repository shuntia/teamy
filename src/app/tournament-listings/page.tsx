import { PublicPageLayout } from '@/components/public-page-layout'
import { DashboardTournamentsClient } from '@/components/dashboard-tournaments-client'

export const metadata = {
  title: 'Tournament Listings | Teamy',
  description: 'Browse approved Science Olympiad tournaments and invitational competitions.',
}

export default async function TournamentListingsPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Tournament Listings
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse and sign up for approved Science Olympiad tournaments
          </p>
        </div>

        {/* Tournament List Component */}
        <DashboardTournamentsClient />
      </div>
    </PublicPageLayout>
  )
}
