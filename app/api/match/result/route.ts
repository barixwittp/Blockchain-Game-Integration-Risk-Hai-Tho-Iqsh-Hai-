import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { matchId, winner } = await request.json()

    // Mock result commitment
    // In real implementation, this would call CoinFlipGame.commitResult()

    const flipResult = Math.random() < 0.5 ? "heads" : "tails"

    const response = {
      success: true,
      result: flipResult,
      winner: winner,
      txHash: "0x" + Math.random().toString(16).substr(2, 64),
      message: `Coin landed on ${flipResult}!`,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to commit result" }, { status: 500 })
  }
}
