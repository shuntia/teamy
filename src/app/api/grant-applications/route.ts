import { NextResponse } from 'next/server'

const GRANTS_DISCORD_WEBHOOK_URL = process.env.GRANTS_DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1457414413459128494/DH2L77mREnKKf2CGDCfiFRFP0iNfV5iBC-SmSVoWvwjrhaoQwGiF3aBJLXq4xF3y-_XI'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      clubName,
      schoolName,
      schoolAddress,
      clubDivision,
      numberOfTeams,
      yearsParticipating,
      grantAmount,
      clubDescription,
      grantBenefit,
      suggestions,
      contactRole,
      applicantName,
      applicantEmail,
      coachName,
      coachEmail,
    } = body

    // Validate required fields
    if (!clubName || !schoolName || !schoolAddress || !clubDivision || 
        !numberOfTeams || !yearsParticipating || !grantAmount ||
        !clubDescription || !grantBenefit || !contactRole || 
        !applicantName || !applicantEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If officer, coach info is required
    if (contactRole === 'officer' && (!coachName || !coachEmail)) {
      return NextResponse.json(
        { error: 'Coach information required for officer/captain applications' },
        { status: 400 }
      )
    }

    // Send Discord webhook notification
    if (GRANTS_DISCORD_WEBHOOK_URL) {
      const contactInfo = contactRole === 'coach' 
        ? `Coach: ${applicantName} (${applicantEmail})`
        : `Officer/Captain: ${applicantName} (${applicantEmail})\nCoach: ${coachName} (${coachEmail})`

      const embed = {
        title: 'New Grant Application',
        color: 0x0056C7,
        fields: [
          {
            name: 'Club Information',
            value: `Club: ${clubName}\nSchool: ${schoolName}\nAddress: ${schoolAddress}`,
            inline: false,
          },
          {
            name: 'Division',
            value: clubDivision,
            inline: true,
          },
          {
            name: 'Number of Teams',
            value: numberOfTeams,
            inline: true,
          },
          {
            name: 'Years in Science Olympiad',
            value: yearsParticipating,
            inline: true,
          },
          {
            name: 'Requested Amount',
            value: `$${grantAmount}`,
            inline: true,
          },
          {
            name: 'Club Description',
            value: clubDescription.substring(0, 1000) + (clubDescription.length > 1000 ? '...' : ''),
            inline: false,
          },
          {
            name: 'How Grant Would Benefit Team',
            value: grantBenefit.substring(0, 1000) + (grantBenefit.length > 1000 ? '...' : ''),
            inline: false,
          },
          ...(suggestions ? [{
            name: 'Suggestions for Teamy',
            value: suggestions.substring(0, 500) + (suggestions.length > 500 ? '...' : ''),
            inline: false,
          }] : []),
          {
            name: 'Contact Information',
            value: contactInfo,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
      }

      try {
        await fetch(GRANTS_DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            embeds: [embed],
          }),
        })
      } catch (webhookError) {
        console.error('Failed to send Discord webhook:', webhookError)
        // Don't fail the request if webhook fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Grant application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

