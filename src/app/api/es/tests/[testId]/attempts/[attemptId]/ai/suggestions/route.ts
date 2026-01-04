import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper to check if user has access to grade an ES test
async function hasESGradingAccess(userId: string, userEmail: string, testId: string): Promise<boolean> {
  const test = await prisma.eSTest.findUnique({
    where: { id: testId },
    select: { tournamentId: true, eventId: true },
  })

  if (!test) return false

  // Check if user is a tournament director
  const isTD = await (async () => {
    const admin = await prisma.tournamentAdmin.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId: test.tournamentId,
          userId,
        },
      },
    })
    if (admin) return true

    const tournament = await prisma.tournament.findUnique({
      where: { id: test.tournamentId },
      select: { createdById: true },
    })
    if (tournament?.createdById === userId) return true

    const hostingRequest = await prisma.tournamentHostingRequest.findFirst({
      where: {
        tournament: { id: test.tournamentId },
        directorEmail: { equals: userEmail, mode: 'insensitive' },
        status: 'APPROVED',
      },
    })
    return !!hostingRequest
  })()

  if (isTD) return true

  // Check if user is ES assigned to this event
  const staffMemberships = await prisma.tournamentStaff.findMany({
    where: {
      OR: [{ userId }, { email: { equals: userEmail, mode: 'insensitive' } }],
      status: 'ACCEPTED',
      tournamentId: test.tournamentId,
    },
    include: {
      events: {
        select: { eventId: true },
      },
    },
  })

  if (test.eventId) {
    return staffMemberships.some(staff => 
      staff.events.some(e => e.eventId === test.eventId)
    )
  }

  // For trial events, any ES staff member with access to tournament can grade
  return staffMemberships.length > 0
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ testId: string; attemptId: string }> | { testId: string; attemptId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)

    // Check access
    const hasAccess = await hasESGradingAccess(session.user.id, session.user.email, resolvedParams.testId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Only authorized users can view AI suggestions' }, { status: 403 })
    }

    const attempt = await prisma.eSTestAttempt.findUnique({
      where: { id: resolvedParams.attemptId },
      select: { testId: true },
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    if (attempt.testId !== resolvedParams.testId) {
      return NextResponse.json({ error: 'Attempt does not belong to this test' }, { status: 400 })
    }

    const suggestions = await prisma.aiGradingSuggestion.findMany({
      where: { attemptId: resolvedParams.attemptId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      suggestions: suggestions.map((suggestion) => ({
        id: suggestion.id,
        answerId: suggestion.answerId,
        questionId: suggestion.questionId,
        suggestedPoints: Number(suggestion.suggestedPoints),
        maxPoints: Number(suggestion.maxPoints),
        explanation: suggestion.explanation,
        strengths: suggestion.strengths,
        gaps: suggestion.gaps,
        rubricAlignment: suggestion.rubricAlignment,
        status: suggestion.status,
        createdAt: suggestion.createdAt.toISOString(),
        updatedAt: suggestion.updatedAt.toISOString(),
        acceptedAt: suggestion.acceptedAt?.toISOString() || null,
        acceptedPoints: suggestion.acceptedPoints ? Number(suggestion.acceptedPoints) : null,
        rawResponse: suggestion.rawResponse, // Include rawResponse for part suggestions
      })),
    })
  } catch (error) {
    console.error('AI suggestions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to load AI suggestions' },
      { status: 500 }
    )
  }
}
