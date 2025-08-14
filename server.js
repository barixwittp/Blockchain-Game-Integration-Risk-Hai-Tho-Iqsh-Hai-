const express = require("express")
const cors = require("cors")
const { ethers } = require("ethers")
const crypto = require("crypto")
const path = require("path")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

// Blockchain setup
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545")
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || "0x" + "1".repeat(64), provider)

// Contract addresses (update after deployment)
const GAME_TOKEN_ADDRESS = process.env.GAME_TOKEN_ADDRESS
const TOKEN_STORE_ADDRESS = process.env.TOKEN_STORE_ADDRESS
const COIN_FLIP_GAME_ADDRESS = process.env.COIN_FLIP_GAME_ADDRESS

// In-memory storage (use database in production)
const matches = new Map()
const leaderboard = new Map()
const waitingPlayers = []

// Contract ABIs (simplified)
const gameTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
]

const tokenStoreABI = [
  "function buy(uint256 usdtAmount) external",
  "event Purchase(address indexed buyer, uint256 usdtAmount, uint256 gtAmount)",
]

const coinFlipGameABI = [
  "function createMatch(bytes32 matchId, address p1, address p2, uint256 stake) external",
  "function stake(bytes32 matchId, uint8 choice) external",
  "function commitResult(bytes32 matchId, address winner) external",
  "event MatchCreated(bytes32 indexed matchId, address indexed player1, uint8 choice, uint256 stake)",
  "event Staked(bytes32 indexed matchId, address indexed player)",
  "event Settled(bytes32 indexed matchId, address indexed winner, uint8 winningChoice)",
]

// Initialize contracts
let gameTokenContract, tokenStoreContract, coinFlipGameContract

if (GAME_TOKEN_ADDRESS && TOKEN_STORE_ADDRESS && COIN_FLIP_GAME_ADDRESS) {
  gameTokenContract = new ethers.Contract(GAME_TOKEN_ADDRESS, gameTokenABI, wallet)
  tokenStoreContract = new ethers.Contract(TOKEN_STORE_ADDRESS, tokenStoreABI, wallet)
  coinFlipGameContract = new ethers.Contract(COIN_FLIP_GAME_ADDRESS, coinFlipGameABI, wallet)
}

// API Routes

// Get player balance
app.get("/api/balance/:address", async (req, res) => {
  try {
    if (!gameTokenContract) {
      return res.status(500).json({ error: "Contracts not initialized" })
    }

    const balance = await gameTokenContract.balanceOf(req.params.address)
    res.json({ balance: ethers.formatEther(balance) })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Buy GT tokens
app.post("/api/purchase", async (req, res) => {
  try {
    const { amount } = req.body

    if (!tokenStoreContract) {
      return res.status(500).json({ error: "Contracts not initialized" })
    }

    // This would typically be called from frontend with user's wallet
    // Here we're just returning the transaction data
    res.json({
      success: true,
      message: "Call tokenStore.buy() from frontend with MetaMask",
      amount: amount,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create or join match
app.post("/api/match/start", async (req, res) => {
  try {
    const { playerAddress, choice, stake } = req.body

    // Find waiting player with opposite choice and same stake
    const oppositeChoice = choice === "HEADS" ? "TAILS" : "HEADS"
    const waitingPlayerIndex = waitingPlayers.findIndex((p) => p.choice === oppositeChoice && p.stake === stake)

    if (waitingPlayerIndex !== -1) {
      // Match found
      const opponent = waitingPlayers[waitingPlayerIndex]
      waitingPlayers.splice(waitingPlayerIndex, 1)

      const matchId = crypto.randomBytes(32).toString("hex")
      const match = {
        id: matchId,
        player1: playerAddress,
        player2: opponent.address,
        p1Choice: choice,
        p2Choice: opponent.choice,
        stake: stake,
        status: "CREATED",
        createdAt: Date.now(),
      }

      matches.set(matchId, match)

      // Create match on blockchain
      if (coinFlipGameContract) {
        try {
          const tx = await coinFlipGameContract.createMatch(
            "0x" + matchId,
            playerAddress,
            opponent.address,
            ethers.parseEther(stake.toString()),
          )
          await tx.wait()
        } catch (error) {
          console.error("Blockchain match creation failed:", error)
        }
      }

      res.json({
        success: true,
        matchId: matchId,
        opponent: opponent.address,
        message: "Match found! Both players need to stake tokens.",
      })
    } else {
      // No match found, add to waiting list
      waitingPlayers.push({
        address: playerAddress,
        choice: choice,
        stake: stake,
        timestamp: Date.now(),
      })

      res.json({
        success: true,
        message: "Waiting for opponent...",
        waiting: true,
      })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get match status
app.get("/api/match/:matchId", (req, res) => {
  const match = matches.get(req.params.matchId)
  if (!match) {
    return res.status(404).json({ error: "Match not found" })
  }
  res.json(match)
})

// Submit match result (called after both players stake)
app.post("/api/match/:matchId/result", async (req, res) => {
  try {
    const matchId = req.params.matchId
    const match = matches.get(matchId)

    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    if (match.status !== "STAKED") {
      return res.status(400).json({ error: "Match not ready for result" })
    }

    // Flip coin (50/50 random)
    const coinFlip = Math.random() < 0.5 ? "HEADS" : "TAILS"
    const winner = match.p1Choice === coinFlip ? match.player1 : match.player2

    match.result = coinFlip
    match.winner = winner
    match.status = "SETTLED"
    match.settledAt = Date.now()

    // Update leaderboard
    const currentWins = leaderboard.get(winner) || 0
    leaderboard.set(winner, currentWins + match.stake * 2)

    // Commit result to blockchain
    if (coinFlipGameContract) {
      try {
        const tx = await coinFlipGameContract.commitResult("0x" + matchId, winner)
        await tx.wait()
        match.txHash = tx.hash
      } catch (error) {
        console.error("Blockchain result commit failed:", error)
      }
    }

    res.json({
      success: true,
      result: coinFlip,
      winner: winner,
      txHash: match.txHash,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get leaderboard
app.get("/api/leaderboard", (req, res) => {
  const sortedLeaderboard = Array.from(leaderboard.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([address, totalWon]) => ({ address, totalWon }))

  res.json(sortedLeaderboard)
})

// Get waiting players (for debugging)
app.get("/api/waiting", (req, res) => {
  res.json(waitingPlayers)
})

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Game available at http://localhost:${PORT}`)
})
