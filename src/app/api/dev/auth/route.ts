import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// WARNING: This endpoint is for development only
// Verify dev panel email whitelist server-side

async function getEmailWhitelist(): Promise<string[]> {
  // Try to get from database first
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'dev_panel_email_whitelist' },
  })

  if (setting) {
    try {
      const emails = JSON.parse(setting.value)
      if (Array.isArray(emails) && emails.length > 0) {
        return emails
      }
      // If empty array or invalid, fall back to defaults
    } catch (e) {
      console.error('Failed to parse email whitelist from database:', e)
      // Fall back to defaults on parse error
    }
  }

  // Fallback to default emails from environment variable if not in database, empty, or invalid
  // Format: comma-separated list of emails
  // Example: DEV_PANEL_DEFAULT_EMAILS="email1@example.com,email2@example.com"
  const defaultEmailsEnv = process.env.DEV_PANEL_DEFAULT_EMAILS
  if (defaultEmailsEnv) {
    return defaultEmailsEnv
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email.length > 0 && email.includes('@'))
  }

  // If no environment variable set, return empty array (will deny access)
  console.warn('DEV_PANEL_DEFAULT_EMAILS environment variable is not set. Dev panel access may be restricted.')
  return []
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with Google.' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email.toLowerCase().trim()
    const whitelist = await getEmailWhitelist()

    const isAllowed = whitelist.some(
      (email) => email.toLowerCase().trim() === userEmail
    )

    if (isAllowed) {
      return NextResponse.json({ success: true, email: userEmail })
    } else {
      return NextResponse.json(
        { error: 'Your email is not authorized to access the dev panel' },
        { status: 403 }
      )
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

