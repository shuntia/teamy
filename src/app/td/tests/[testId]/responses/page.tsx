import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { isTournamentAdmin, isTournamentDirector } from '@/lib/rbac'
import { ESTestAttemptsView } from '@/components/tests/es-test-attempts-view'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ testId: string }>
}

// Helper to check if user is a tournament director for a tournament
async function isTD(userId: string, userEmail: string, tournamentId: string): Promise<boolean> {
  const admin = await prisma.tournamentAdmin.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId,
        userId,
      },
    },
  })
  
  if (admin) return true
  
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { createdById: true },
  })
  
  if (tournament?.createdById === userId) return true
  
  const hostingRequest = await prisma.tournamentHostingRequest.findFirst({
    where: {
      tournament: {
        id: tournamentId,
      },
      directorEmail: {
        equals: userEmail,
        mode: 'insensitive',
      },
      status: 'APPROVED',
    },
  })
  
  if (hostingRequest) return true
  
  const staffRecord = await prisma.tournamentStaff.findFirst({
    where: {
      tournamentId,
      role: 'TOURNAMENT_DIRECTOR',
      status: 'ACCEPTED',
      OR: [
        { userId },
        {
          email: {
            equals: userEmail,
            mode: 'insensitive',
          },
        },
      ],
    },
  })
  
  return !!staffRecord
}

export default async function TDTestResponsesPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect('/td')
  }

  const { testId } = await params

  // Find the ES test
  // Use select to avoid fields that might not exist yet (if migration hasn't run)
  const esTest = await prisma.eSTest.findUnique({
    where: { id: testId },
    select: {
      id: true,
      name: true,
      description: true,
      tournamentId: true,
      staff: {
        include: {
          tournament: {
            select: {
              id: true,
              name: true,
              division: true,
            },
          },
        },
      },
    },
  })

  if (!esTest) {
    notFound()
  }

  // Verify user is a tournament director or admin for this tournament
  const isTDUser = await isTD(session.user.id, session.user.email, esTest.tournamentId)
  const isAdmin = await isTournamentAdmin(session.user.id, esTest.tournamentId)
  
  if (!isTDUser && !isAdmin) {
    redirect('/td')
  }

  // Get tournament info
  let tournament = esTest.staff?.tournament
  
  if (!tournament) {
    const tournamentData = await prisma.tournament.findUnique({
      where: { id: esTest.tournamentId },
      select: {
        id: true,
        name: true,
        division: true,
      },
    })
    
    if (!tournamentData) {
      redirect('/td')
    }
    
    tournament = tournamentData
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 grid-pattern">
      <div className="container mx-auto max-w-6xl space-y-8 py-8 px-4 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2">
            <Link 
              href={`/td/tournament/${tournament.id}`}
              className="w-fit"
            >
              <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tournament
              </Button>
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">{esTest.name}</h1>
            {esTest.description && (
              <p className="text-muted-foreground">{esTest.description}</p>
            )}
          </div>
        </div>

        <ESTestAttemptsView
          testId={esTest.id}
          testName={esTest.name}
          scoresReleased={(esTest as any).scoresReleased || false}
        />
      </div>
    </div>
  )
}
