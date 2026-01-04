import { NextRequest, NextResponse } from 'next/server'

const DEMO_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1457414705717973023/BF0Lcg7sztj4YM-Lq-ct_zoeIKmRzgL3T4E4HJZR_XLVVE6cx0cXX4g-9tZj3yXu3O0p'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, schoolName } = body

    // Validate input
    if (!email || !schoolName) {
      return NextResponse.json(
        { error: 'Email and school name are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create Discord embed message
    const discordPayload = {
      embeds: [
        {
          title: 'New Demo Request',
          color: 0x0056C7, // Teamy primary blue
          fields: [
            {
              name: 'Email',
              value: email,
              inline: true,
            },
            {
              name: 'School Name',
              value: schoolName,
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Teamy Demo Request',
          },
        },
      ],
    }

    // Send to Discord webhook
    const discordResponse = await fetch(DEMO_DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    })

    if (!discordResponse.ok) {
      console.error('Discord webhook failed:', await discordResponse.text())
      return NextResponse.json(
        { error: 'Failed to send demo request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Demo request error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}
