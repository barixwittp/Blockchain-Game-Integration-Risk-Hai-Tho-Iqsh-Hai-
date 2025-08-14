import { type NextRequest, NextResponse } from "next/server"

// In-memory match storage (use database in production)
const matches = new Map()

export async function POST(request: NextRequest) {
  try {
    const { userAddress, choice, stake } = await request.json()

    // Look for existing match with opposite choice and same stake
    const existingMatch = Array.from(matches.values()).find(
      (match: any) => match.status === "waiting" && match.choice1 !== choice && match.stake === stake,
    )

    if (existingMatch) {
      // Join existing match
      existingMatch.player2 = userAddress
      existingMatch.choice2 = choice
      existingMatch.status = "staked"

      return NextResponse.json({
        success: true,
        match: existingMatch,
        message: "Match found! Both players staked.",
      })
    } else {
      // Create new match
      const matchId = Date.now().toString()
      const newMatch = {
        id: matchId,
        player1: userAddress,
        choice1: choice,
        stake: stake,
        status: "waiting",
        createdAt: new Date(),
      }

      matches.set(matchId, newMatch)

      return NextResponse.json({
        success: true,
        match: newMatch,
        message: "Waiting for opponent...",
      })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to create/join match" }, { status: 500 })
  }
}
