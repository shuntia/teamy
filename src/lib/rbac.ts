import { prisma } from './prisma'
import { Role } from '@prisma/client'

/**
 * Get user's membership and role in a club
 */
export async function getUserMembership(userId: string, clubId: string) {
  return prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId,
        clubId,
      },
    },
    include: {
      club: true,
      team: true,
      user: true,
    },
  })
}

/**
 * Check if user is an admin of a club
 */
export async function isAdmin(userId: string, clubId: string): Promise<boolean> {
  const membership = await getUserMembership(userId, clubId)
  return membership?.role === Role.ADMIN
}

/**
 * Check if user is a member of a club (any role)
 */
export async function isMember(userId: string, clubId: string): Promise<boolean> {
  const membership = await getUserMembership(userId, clubId)
  return !!membership
}

/**
 * Require admin role, throw if not authorized
 */
export async function requireAdmin(userId: string, clubId: string) {
  const isAuth = await isAdmin(userId, clubId)
  if (!isAuth) {
    throw new Error('UNAUTHORIZED: Admin role required')
  }
}

/**
 * Require club membership (any role), throw if not authorized
 */
export async function requireMember(userId: string, clubId: string) {
  const isAuth = await isMember(userId, clubId)
  if (!isAuth) {
    throw new Error('UNAUTHORIZED: Club membership required')
  }
}

/**
 * Get all clubs a user belongs to
 */
export async function getUserClubs(userId: string) {
  return prisma.membership.findMany({
    where: { userId },
    include: {
      club: true,
      team: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

/**
 * Check if user is a tournament admin for a tournament
 */
export async function isTournamentAdmin(userId: string, tournamentId: string): Promise<boolean> {
  const admin = await prisma.tournamentAdmin.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId,
        userId,
      },
    },
  })
  
  if (admin) return true
  
  // Also check if user is the creator (creators should always have admin access)
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { createdById: true },
  })
  
  return tournament?.createdById === userId
}

/**
 * Check if user is a tournament director for a tournament
 */
export async function isTournamentDirector(userId: string, userEmail: string, tournamentId: string): Promise<boolean> {
  // Check if user is tournament admin
  const admin = await prisma.tournamentAdmin.findUnique({
    where: {
      tournamentId_userId: {
        tournamentId,
        userId,
      },
    },
  })
  
  if (admin) return true
  
  // Check if user created the tournament
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { createdById: true },
  })
  
  if (tournament?.createdById === userId) return true
  
  // Check if user is the director on the hosting request
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
  
  // Also check if user is a TD via TournamentStaff
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
