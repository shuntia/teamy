import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { TournamentDetailClient } from '@/components/tournament-detail-client'
import { TournamentPageClient } from '@/components/tournament-page-client'

interface Props {
  params: { param: string }
}

export default async function TournamentPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const { param } = params

  // First, try to find a tournament by ID
  const tournamentById = await prisma.tournament.findUnique({
    where: { id: param },
    include: {
      hostingRequest: true,
    }
  })

  if (tournamentById) {
    // If tournament has a slug, redirect to the slug-based URL for consistency
    if (tournamentById.slug) {
      redirect(`/tournaments/${tournamentById.slug}`)
    }
    
    // If tournament has a hosting request with a slug, use that
    if (tournamentById.hostingRequest?.preferredSlug) {
      redirect(`/tournaments/${tournamentById.hostingRequest.preferredSlug}`)
    }
    
    // No slug available - show the tournament page directly without requiring login
    // Get user's clubs if logged in (for registration)
    let userClubs: { id: string; name: string; division: string; teams: { id: string; name: string }[] }[] = []
    if (session?.user) {
      const memberships = await prisma.membership.findMany({
        where: { 
          userId: session.user.id,
          role: Role.ADMIN,
        },
        include: {
          club: {
            include: {
              teams: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      const uniqueClubs = new Map()
      for (const membership of memberships) {
        if (!uniqueClubs.has(membership.club.id)) {
          uniqueClubs.set(membership.club.id, {
            id: membership.club.id,
            name: membership.club.name,
            division: membership.club.division,
            teams: membership.club.teams || [],
          })
        }
      }
      userClubs = Array.from(uniqueClubs.values())
    }

    // Check if user is the tournament director
    const isDirector = session?.user?.email?.toLowerCase() === tournamentById.hostingRequest?.directorEmail?.toLowerCase()

    // Check if tournament is published (or user is director)
    if (!tournamentById.published && !isDirector) {
      notFound()
    }

    // Use hosting request division for display (supports "B&C")
    const displayDivision = tournamentById.hostingRequest?.division || tournamentById.division || 'C'
    const serializedTournament = {
      id: tournamentById.id,
      name: tournamentById.name,
      slug: tournamentById.slug,
      division: displayDivision,
      description: tournamentById.description,
      isOnline: tournamentById.isOnline,
      startDate: tournamentById.startDate.toISOString(),
      endDate: tournamentById.endDate.toISOString(),
      startTime: tournamentById.startTime.toISOString(),
      endTime: tournamentById.endTime.toISOString(),
      location: tournamentById.location,
      price: tournamentById.price,
      additionalTeamPrice: tournamentById.additionalTeamPrice,
      feeStructure: tournamentById.feeStructure,
      registrationStartDate: tournamentById.registrationStartDate?.toISOString() || null,
      registrationEndDate: tournamentById.registrationEndDate?.toISOString() || null,
      earlyBirdDiscount: tournamentById.earlyBirdDiscount,
      earlyBirdDeadline: tournamentById.earlyBirdDeadline?.toISOString() || null,
      lateFee: tournamentById.lateFee,
      lateFeeStartDate: tournamentById.lateFeeStartDate?.toISOString() || null,
      eligibilityRequirements: tournamentById.eligibilityRequirements,
      eventsRun: tournamentById.eventsRun,
      trialEvents: tournamentById.trialEvents,
    }

    return (
      <TournamentPageClient 
        hostingRequest={tournamentById.hostingRequest}
        tournament={serializedTournament}
        isDirector={isDirector}
        user={session?.user}
        userClubs={userClubs}
      />
    )
  }

  // Not a tournament ID - try to find by slug (public tournament page)
  const hostingRequest = await prisma.tournamentHostingRequest.findFirst({
    where: {
      OR: [
        { preferredSlug: param },
        { 
          tournamentName: {
            equals: param.replace(/-/g, ' '),
            mode: 'insensitive'
          }
        }
      ],
      status: 'APPROVED'
    },
    include: {
      tournament: true,
    }
  })

  if (!hostingRequest) {
    notFound()
  }

  // Check if user is the tournament director (they can see unpublished)
  const isDirector = session?.user?.email?.toLowerCase() === hostingRequest.directorEmail.toLowerCase()

  // Check if tournament is published (or user is director)
  if (!hostingRequest.tournament?.published && !isDirector) {
    notFound()
  }

  // Get user's clubs if logged in (for registration)
  let userClubs: { id: string; name: string; division: string; teams: { id: string; name: string }[] }[] = []
  if (session?.user) {
    const memberships = await prisma.membership.findMany({
      where: { 
        userId: session.user.id,
        role: Role.ADMIN,
      },
      include: {
        club: {
          include: {
            teams: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    const uniqueClubs = new Map()
    for (const membership of memberships) {
      if (!uniqueClubs.has(membership.club.id)) {
        uniqueClubs.set(membership.club.id, {
          id: membership.club.id,
          name: membership.club.name,
          division: membership.club.division,
          teams: membership.club.teams || [],
        })
      }
    }
    userClubs = Array.from(uniqueClubs.values())
  }

  // Serialize tournament data
  // Use hosting request division for display (supports "B&C")
  const displayDivision = hostingRequest.division || hostingRequest.tournament?.division || 'C'
  const serializedTournament = hostingRequest.tournament ? {
    id: hostingRequest.tournament.id,
    name: hostingRequest.tournament.name,
    slug: hostingRequest.tournament.slug,
    division: displayDivision,
    description: hostingRequest.tournament.description,
    isOnline: hostingRequest.tournament.isOnline,
    startDate: hostingRequest.tournament.startDate.toISOString(),
    endDate: hostingRequest.tournament.endDate.toISOString(),
    startTime: hostingRequest.tournament.startTime.toISOString(),
    endTime: hostingRequest.tournament.endTime.toISOString(),
    location: hostingRequest.tournament.location,
    price: hostingRequest.tournament.price,
    additionalTeamPrice: hostingRequest.tournament.additionalTeamPrice,
    feeStructure: hostingRequest.tournament.feeStructure,
    registrationStartDate: hostingRequest.tournament.registrationStartDate?.toISOString() || null,
    registrationEndDate: hostingRequest.tournament.registrationEndDate?.toISOString() || null,
    earlyBirdDiscount: hostingRequest.tournament.earlyBirdDiscount,
    earlyBirdDeadline: hostingRequest.tournament.earlyBirdDeadline?.toISOString() || null,
    lateFee: hostingRequest.tournament.lateFee,
    lateFeeStartDate: hostingRequest.tournament.lateFeeStartDate?.toISOString() || null,
    eligibilityRequirements: hostingRequest.tournament.eligibilityRequirements,
    eventsRun: hostingRequest.tournament.eventsRun,
    trialEvents: hostingRequest.tournament.trialEvents,
  } : null

  return (
    <TournamentPageClient 
      hostingRequest={hostingRequest}
      tournament={serializedTournament}
      isDirector={isDirector}
      user={session?.user}
      userClubs={userClubs}
    />
  )
}

