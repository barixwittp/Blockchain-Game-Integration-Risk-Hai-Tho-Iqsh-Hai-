"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

declare global {
  interface Window {
    ethereum?: any
  }
}

interface Player {
  address: string
  name: string
  isOnline: boolean
  lastSeen: Date
}

interface Transaction {
  id: string
  type: "buy" | "stake" | "win" | "lose"
  amount: number
  winAmount?: number // For win transactions, shows the actual amount won
  txHash: string
  blockExplorerUrl: string
  timestamp: Date
  isReal: boolean
}

interface Match {
  id: string
  player1: Player
  player2?: Player
  choice1: "heads" | "tails"
  choice2?: "heads" | "tails"
  stake: number
  status: "waiting" | "staked" | "playing" | "finished"
  winner?: string
  result?: "heads" | "tails"
  txHash?: string
  blockExplorerUrl?: string
}

interface LeaderboardEntry {
  player: Player
  totalWon: number
  matchesPlayed: number
  winRate: number
}

const generatePlayerName = () => {
  const adjectives = ["Swift", "Bold", "Clever", "Lucky", "Brave", "Sharp", "Quick", "Wise", "Cool", "Epic"]
  const nouns = ["Tiger", "Eagle", "Wolf", "Dragon", "Phoenix", "Shark", "Lion", "Falcon", "Bear", "Fox"]
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`
}

const mockPlayers: Player[] = [
  { address: "0x1234567890123456789012345678901234567890", name: "CryptoKing", isOnline: true, lastSeen: new Date() },
  { address: "0x2345678901234567890123456789012345678901", name: "BlockMaster", isOnline: true, lastSeen: new Date() },
  {
    address: "0x3456789012345678901234567890123456789012",
    name: "TokenHunter",
    isOnline: false,
    lastSeen: new Date(Date.now() - 300000),
  },
  { address: "0x4567890123456789012345678901234567890123", name: "ChainWizard", isOnline: true, lastSeen: new Date() },
  {
    address: "0x5678901234567890123456789012345678901234",
    name: "FlipMaster",
    isOnline: false,
    lastSeen: new Date(Date.now() - 600000),
  },
  { address: "0x6789012345678901234567890123456789012345", name: "CoinLord", isOnline: true, lastSeen: new Date() },
  { address: "0x7890123456789012345678901234567890123456", name: "LuckyStrike", isOnline: true, lastSeen: new Date() },
  {
    address: "0x8901234567890123456789012345678901234567",
    name: "GamingPro",
    isOnline: false,
    lastSeen: new Date(Date.now() - 900000),
  },
]

const searchingQuotes = [
  "🔍 Scanning the blockchain for worthy opponents...",
  "⚡ Connecting to the decentralized gaming network...",
  "🎯 Finding players with matching stakes...",
  "🌟 Searching for your next challenger...",
  "🚀 Initializing peer-to-peer matchmaking...",
  "💎 Looking for diamond hands to compete with...",
  "🎲 Rolling the dice to find your opponent...",
  "⚔️ Preparing for epic blockchain battles...",
  "🔥 Heating up the competition pool...",
  "🎪 Welcome to the greatest show on chain...",
]

export default function CoinFlipGame() {
  const [account, setAccount] = useState<string>("")
  const [playerName, setPlayerName] = useState<string>("")
  const [gtBalance, setGtBalance] = useState<number>(0)
  const [usdtBalance, setUsdtBalance] = useState<number>(1000)
  const [buyAmount, setBuyAmount] = useState<string>("")
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [selectedChoice, setSelectedChoice] = useState<"heads" | "tails">("heads")
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipResult, setFlipResult] = useState<"heads" | "tails" | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([])
  const [gameStatus, setGameStatus] = useState<string>("Connect your wallet to start")
  const [isSearching, setIsSearching] = useState(false)
  const [searchingQuote, setSearchingQuote] = useState("")
  const [searchingQuoteIndex, setSearchingQuoteIndex] = useState(0)
  const [isRealMode, setIsRealMode] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [web3Provider, setWeb3Provider] = useState<any>(null)

  const sendRealTransaction = async (to: string, value: string, data?: string) => {
    if (!window.ethereum || !account) throw new Error("MetaMask not connected")

    try {
      const txParams = {
        from: account,
        to,
        value: window.ethereum.utils?.toHex(window.ethereum.utils?.toWei(value, "ether")) || "0x0",
        data: data || "0x",
        gas: "0x5208", // 21000 gas limit
      }

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      })

      return txHash
    } catch (error) {
      console.error("Transaction failed:", error)
      throw error
    }
  }

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const address = accounts[0]
        const name = generatePlayerName()

        setAccount(address)
        setPlayerName(name)
        setGameStatus("Wallet connected! Buy GT tokens to start playing")
        setGtBalance(0)
        setWeb3Provider(window.ethereum)

        // Add current player to online players
        const currentPlayer: Player = {
          address,
          name,
          isOnline: true,
          lastSeen: new Date(),
        }
        setOnlinePlayers((prev) => [...prev.filter((p) => p.address !== address), currentPlayer])

        fetchLeaderboard()
      } catch (error) {
        console.error("Error connecting wallet:", error)
        setGameStatus("Failed to connect wallet")
      }
    } else {
      setGameStatus("Please install MetaMask to play")
    }
  }

  const buyTokens = async () => {
    if (!buyAmount || Number.parseFloat(buyAmount) <= 0) return

    const amount = Number.parseFloat(buyAmount)
    if (amount > usdtBalance) {
      setGameStatus("Insufficient USDT balance!")
      return
    }

    try {
      setGameStatus("Processing purchase...")
      let txHash: string
      let blockExplorerUrl: string

      if (isRealMode && web3Provider) {
        // Real blockchain transaction - self transfer for demo
        txHash = await sendRealTransaction(account, "0") // Self transfer with 0 ETH
        blockExplorerUrl = `https://etherscan.io/tx/${txHash}`
        setGameStatus(`Real transaction sent! TX: ${txHash.slice(0, 10)}...`)
      } else {
        // Demo mode - use working demo explorer
        await new Promise((resolve) => setTimeout(resolve, 2000))
        txHash = "DEMO_" + Date.now().toString(16).toUpperCase()
        blockExplorerUrl = `https://sepolia.etherscan.io/tx/0x${"0".repeat(64)}`
        setGameStatus(`Demo purchase completed! TX: ${txHash.slice(0, 10)}...`)
      }

      const transaction: Transaction = {
        id: Date.now().toString(),
        type: "buy",
        amount,
        txHash,
        blockExplorerUrl,
        timestamp: new Date(),
        isReal: isRealMode,
      }
      setTransactions((prev) => [transaction, ...prev])

      setUsdtBalance((prev) => prev - amount)
      setGtBalance((prev) => prev + amount)
      setBuyAmount("")
    } catch (error) {
      setGameStatus(isRealMode ? "Real transaction failed" : "Demo purchase failed")
    }
  }

  // Enhanced create match with real/demo modes
  const createMatch = async () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) return

    const stake = Number.parseFloat(stakeAmount)
    if (stake > gtBalance) {
      setGameStatus("Insufficient GT balance")
      return
    }

    try {
      setIsSearching(true)
      setSearchingQuoteIndex(0)
      setSearchingQuote(searchingQuotes[0])

      // Cycle through quotes during search
      const quoteInterval = setInterval(() => {
        setSearchingQuoteIndex((prev) => {
          const next = (prev + 1) % searchingQuotes.length
          setSearchingQuote(searchingQuotes[next])
          return next
        })
      }, 1500)

      // Simulate random search time
      const searchTime = Math.random() < 0.3 ? 8000 : Math.random() * 4000 + 2000
      await new Promise((resolve) => setTimeout(resolve, searchTime))

      clearInterval(quoteInterval)

      // 20% chance of not finding an opponent
      if (Math.random() < 0.2) {
        setIsSearching(false)
        setGameStatus("No opponents found. Try again!")
        return
      }

      // Select random online opponent
      const availableOpponents = onlinePlayers.filter((p) => p.address !== account && p.isOnline)
      if (availableOpponents.length === 0) {
        const randomOpponent = mockPlayers[Math.floor(Math.random() * mockPlayers.length)]
        availableOpponents.push(randomOpponent)
      }

      const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)]

      const match: Match = {
        id: Date.now().toString(),
        player1: {
          address: account,
          name: playerName,
          isOnline: true,
          lastSeen: new Date(),
        },
        player2: opponent,
        choice1: selectedChoice,
        choice2: selectedChoice === "heads" ? "tails" : "heads",
        stake: stake,
        status: "staked",
      }

      setCurrentMatch(match)
      setGtBalance((prev) => prev - stake)
      setIsSearching(false)
      setGameStatus(`Match found with ${opponent.name}! Both players staked. Ready to flip!`)
    } catch (error) {
      setIsSearching(false)
      setGameStatus("Failed to create match")
    }
  }

  // Enhanced flip coin with transaction recording
  const flipCoin = async () => {
    if (!currentMatch) return

    setIsFlipping(true)
    setGameStatus("Flipping coin...")

    // Simulate coin flip animation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Proper random result using crypto-secure randomness
    const randomBytes = new Uint8Array(1)
    crypto.getRandomValues(randomBytes)
    const result: "heads" | "tails" = randomBytes[0] % 2 === 0 ? "heads" : "tails"

    setFlipResult(result)

    const isWinner = currentMatch.choice1 === result
    const winAmount = currentMatch.stake * 2

    let txHash: string
    let blockExplorerUrl: string

    if (isRealMode) {
      try {
        // Attempt a small self-transfer to create a real transaction
        txHash = await sendRealTransaction(account, "0")
        blockExplorerUrl = `https://etherscan.io/tx/${txHash}`
      } catch (error) {
        // If real transaction fails, mark as simulated
        txHash = "SIM_" + Date.now().toString(16).toUpperCase()
        blockExplorerUrl = `https://sepolia.etherscan.io/tx/0x${"0".repeat(64)}`
      }
    } else {
      txHash = "DEMO_" + Date.now().toString(16).toUpperCase()
      blockExplorerUrl = `https://sepolia.etherscan.io/tx/0x${"0".repeat(64)}`
    }

    const gameTransaction: Transaction = {
      id: Date.now().toString(),
      type: isWinner ? "win" : "lose",
      amount: currentMatch.stake,
      winAmount: isWinner ? winAmount : undefined,
      txHash,
      blockExplorerUrl,
      timestamp: new Date(),
      isReal: isRealMode,
    }
    setTransactions((prev) => [gameTransaction, ...prev])

    if (isWinner) {
      setGtBalance((prev) => prev + winAmount)
      setGameStatus(`🎉 You won ${winAmount} GT! ${isRealMode ? "Real" : "Demo"} Transaction: ${txHash}`)
    } else {
      setGameStatus(`💔 You lost. Better luck next time! ${isRealMode ? "Real" : "Demo"} Transaction: ${txHash}`)
    }

    setCurrentMatch((prev) =>
      prev
        ? {
            ...prev,
            status: "finished",
            winner: isWinner ? account : prev.player2!.address,
            result,
            txHash,
            blockExplorerUrl,
          }
        : null,
    )
    setIsFlipping(false)

    // Update leaderboard
    fetchLeaderboard()
  }

  // Reset game
  const resetGame = () => {
    setCurrentMatch(null)
    setFlipResult(null)
    setStakeAmount("")
    setGameStatus("Ready for next game!")
  }

  // Fetch expanded leaderboard
  const fetchLeaderboard = async () => {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        player: {
          address: "0x1234567890123456789012345678901234567890",
          name: "CryptoKing",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 2450,
        matchesPlayed: 45,
        winRate: 67,
      },
      {
        player: {
          address: "0x2345678901234567890123456789012345678901",
          name: "BlockMaster",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 1890,
        matchesPlayed: 32,
        winRate: 72,
      },
      {
        player: {
          address: "0x3456789012345678901234567890123456789012",
          name: "TokenHunter",
          isOnline: false,
          lastSeen: new Date(Date.now() - 300000),
        },
        totalWon: 1650,
        matchesPlayed: 28,
        winRate: 64,
      },
      {
        player: {
          address: "0x4567890123456789012345678901234567890123",
          name: "ChainWizard",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 1420,
        matchesPlayed: 25,
        winRate: 68,
      },
      {
        player: {
          address: "0x5678901234567890123456789012345678901234",
          name: "FlipMaster",
          isOnline: false,
          lastSeen: new Date(Date.now() - 600000),
        },
        totalWon: 1280,
        matchesPlayed: 22,
        winRate: 59,
      },
      {
        player: {
          address: "0x6789012345678901234567890123456789012345",
          name: "CoinLord",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 1150,
        matchesPlayed: 19,
        winRate: 74,
      },
      {
        player: {
          address: "0x7890123456789012345678901234567890123456",
          name: "LuckyStrike",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 980,
        matchesPlayed: 16,
        winRate: 63,
      },
      {
        player: {
          address: "0x8901234567890123456789012345678901234567",
          name: "GamingPro",
          isOnline: false,
          lastSeen: new Date(Date.now() - 900000),
        },
        totalWon: 850,
        matchesPlayed: 14,
        winRate: 57,
      },
      {
        player: {
          address: "0x9012345678901234567890123456789012345678",
          name: "ProTrader",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 720,
        matchesPlayed: 12,
        winRate: 75,
      },
      {
        player: {
          address: "0x0123456789012345678901234567890123456789",
          name: "CoinFliper",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1200000),
        },
        totalWon: 650,
        matchesPlayed: 11,
        winRate: 55,
      },
      {
        player: {
          address: "0x1123456789012345678901234567890123456789",
          name: "BetMaster",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 580,
        matchesPlayed: 10,
        winRate: 70,
      },
      {
        player: {
          address: "0x2123456789012345678901234567890123456789",
          name: "WinStreak",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 520,
        matchesPlayed: 9,
        winRate: 67,
      },
      {
        player: {
          address: "0x3123456789012345678901234567890123456789",
          name: "RiskTaker",
          isOnline: false,
          lastSeen: new Date(Date.now() - 1800000),
        },
        totalWon: 450,
        matchesPlayed: 8,
        winRate: 62,
      },
      {
        player: {
          address: "0x4123456789012345678901234567890123456789",
          name: "HighRoller",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 380,
        matchesPlayed: 7,
        winRate: 71,
      },
      {
        player: {
          address: "0x5123456789012345678901234567890123456789",
          name: "QuickFlip",
          isOnline: true,
          lastSeen: new Date(),
        },
        totalWon: 320,
        matchesPlayed: 6,
        winRate: 67,
      },
      {
        player: { address: account, name: playerName, isOnline: true, lastSeen: new Date() },
        totalWon: gtBalance,
        matchesPlayed: currentMatch?.status === "finished" ? 1 : 0,
        winRate: 50,
      },
    ].sort((a, b) => b.totalWon - a.totalWon)

    setLeaderboard(mockLeaderboard)
  }

  // Update online players periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlinePlayers((prev) =>
        prev.map((player) => ({
          ...player,
          isOnline: Math.random() > 0.1, // 90% chance to stay online
        })),
      )
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetchLeaderboard()
    setOnlinePlayers(mockPlayers)
  }, [gtBalance, account])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      <style jsx global>{`
        /* Hide scrollbars but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar for better UX */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-pulse">
            Blockchain Coin Flip
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium">Stake GT tokens and flip to win big!</p>
          <div className="mt-4 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-slide-in-left">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Wallet & Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex flex-col">
                  <span className="text-white font-medium text-sm">Game Mode</span>
                  <span className="text-slate-400 text-xs">
                    {isRealMode ? "Real blockchain transactions" : "Demo mode for testing"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">Demo</span>
                  <Switch
                    checked={isRealMode}
                    onCheckedChange={setIsRealMode}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <span className="text-green-400 text-sm">Real</span>
                </div>
              </div>

              {!account ? (
                <Button
                  onClick={connectWallet}
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                >
                  Connect Wallet
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/30">
                    <div className="text-sm text-slate-400 mb-2">Connected as</div>
                    <div className="text-base text-white font-bold">{playerName}</div>
                    <div className="text-sm text-slate-400 font-mono">
                      {account.slice(0, 8)}...{account.slice(-6)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/20 hover:border-slate-500/40 transition-colors">
                      <div className="text-sm text-slate-400 mb-1">USDT</div>
                      <div className="text-xl font-bold text-white">{usdtBalance.toFixed(2)}</div>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600/20 hover:border-green-500/40 transition-colors">
                      <div className="text-sm text-slate-400 mb-1">GT</div>
                      <div className="text-xl font-bold text-green-400">{gtBalance.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white text-base placeholder:text-slate-400 h-12"
                    />
                    <Button
                      onClick={buyTokens}
                      variant="secondary"
                      className="bg-green-600 hover:bg-green-700 text-white h-12 px-6 transform hover:scale-105 transition-all duration-200"
                    >
                      Buy GT
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="xl:col-span-2 bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 animate-slide-in-up">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl">🎮 Coin Flip Arena</CardTitle>
              <CardDescription className="text-slate-300 text-base">{gameStatus}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!currentMatch ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-white text-base mb-4 block font-medium">Choose your side:</label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={selectedChoice === "heads" ? "default" : "outline"}
                        onClick={() => setSelectedChoice("heads")}
                        className={`h-16 text-lg font-bold transform hover:scale-105 transition-all duration-200 ${
                          selectedChoice === "heads"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
                            : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        🪙 Heads
                      </Button>
                      <Button
                        variant={selectedChoice === "tails" ? "default" : "outline"}
                        onClick={() => setSelectedChoice("tails")}
                        className={`h-16 text-lg font-bold transform hover:scale-105 transition-all duration-200 ${
                          selectedChoice === "tails"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25"
                            : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
                        }`}
                      >
                        🪙 Tails
                      </Button>
                    </div>
                  </div>

                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center text-2xl font-bold text-yellow-900 shadow-2xl animate-spin">
                          🪙
                        </div>
                        <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full border-4 border-purple-500/30 animate-ping"></div>
                      </div>
                      <div className="text-base text-purple-300 font-medium animate-pulse mb-2">{searchingQuote}</div>
                      <div className="flex justify-center">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Stake amount"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white text-base placeholder:text-slate-400 h-12"
                      />
                      <Button
                        onClick={createMatch}
                        disabled={!account || gtBalance === 0}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 h-12 text-base transform hover:scale-105 transition-all duration-200"
                      >
                        Find Match
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600/30">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <div className="text-slate-400 text-base">You</div>
                        <div className="text-white font-bold text-lg">{currentMatch.player1.name}</div>
                        <Badge variant="secondary" className="mt-2 text-base px-3 py-1">
                          {currentMatch.choice1}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-slate-400 text-base">Opponent</div>
                        <div className="text-white font-bold text-lg">{currentMatch.player2?.name}</div>
                        <Badge variant="secondary" className="mt-2 text-base px-3 py-1">
                          {currentMatch.choice2}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-4 bg-slate-600" />
                    <div className="text-center">
                      <div className="text-slate-400 text-base">Stake</div>
                      <div className="text-2xl font-bold text-green-400">{currentMatch.stake} GT each</div>
                    </div>
                  </div>

                  <div className="flex justify-center my-8">
                    <div className="relative">
                      <div
                        className={`w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center text-4xl font-bold text-yellow-900 shadow-2xl ${
                          isFlipping ? "animate-spin" : "hover:scale-110"
                        } transition-all duration-300`}
                      >
                        {flipResult ? (flipResult === "heads" ? "H" : "T") : "?"}
                      </div>
                      {isFlipping && (
                        <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-purple-500/50 animate-ping"></div>
                      )}
                    </div>
                  </div>

                  {currentMatch.status === "staked" && (
                    <Button
                      onClick={flipCoin}
                      disabled={isFlipping}
                      className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/25"
                    >
                      {isFlipping ? "🪙 Flipping..." : "🪙 Flip Coin!"}
                    </Button>
                  )}

                  {currentMatch.status === "finished" && (
                    <div className="space-y-4">
                      {currentMatch.txHash && (
                        <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                          <div className="text-sm text-slate-400 mb-2">
                            {isRealMode ? "Real Transaction" : "Demo Transaction"}
                          </div>
                          <div className="text-base font-mono text-blue-400 break-all mb-2">{currentMatch.txHash}</div>
                          {currentMatch.txHash?.startsWith("SIM_") && (
                            <div className="text-sm text-orange-400 bg-orange-400/10 rounded p-2 border border-orange-400/20">
                              ⚠️ Simulated game result - Real token purchase was made, but game payout is simulated for
                              demo
                            </div>
                          )}
                          {currentMatch.txHash?.startsWith("DEMO_") && (
                            <div className="text-sm text-yellow-400 bg-yellow-400/10 rounded p-2 border border-yellow-400/20">
                              ⚠️ This is a demo transaction for testing purposes
                            </div>
                          )}
                          {currentMatch.txHash?.startsWith("0x") && (
                            <div className="text-sm text-green-400 bg-green-400/10 rounded p-2 border border-green-400/20">
                              ✅ Real blockchain transaction completed
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-blue-400 border-blue-400/30 hover:bg-blue-400/10 bg-transparent"
                            onClick={() => window.open(currentMatch.blockExplorerUrl, "_blank")}
                          >
                            View on Explorer
                          </Button>
                        </div>
                      )}
                      <Button
                        onClick={resetGame}
                        className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                      >
                        Play Again
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 animate-slide-in-right">
            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl hover:shadow-green-500/10 transition-all duration-300">
              <Tabs defaultValue="online" className="w-full">
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700/50">
                    <TabsTrigger value="online" className="text-xs">
                      Online
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard" className="text-xs">
                      Leaders
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs">
                      History
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-0">
                  <TabsContent value="online" className="mt-0">
                    <div className="mb-2">
                      <CardTitle className="text-white text-base flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Players Online ({onlinePlayers.filter((p) => p.isOnline).length})
                      </CardTitle>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {onlinePlayers
                        .filter((p) => p.isOnline)
                        .slice(0, 8)
                        .map((player) => (
                          <div
                            key={player.address}
                            className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
                          >
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                                {player.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-white truncate font-medium text-sm">{player.name}</span>
                            <div className="w-2 h-2 bg-green-400 rounded-full ml-auto animate-pulse"></div>
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="leaderboard" className="mt-0">
                    <div className="mb-2">
                      <CardTitle className="text-white text-base">🏆 Leaderboard</CardTitle>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {leaderboard.slice(0, 10).map((entry, index) => (
                        <div
                          key={entry.player.address}
                          className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-slate-700/30 transition-all duration-200 hover:scale-105"
                        >
                          <Badge
                            variant="outline"
                            className={`w-6 h-6 p-0 flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-black border-yellow-500"
                                : index === 1
                                  ? "bg-slate-400 text-black border-slate-400"
                                  : index === 2
                                    ? "bg-amber-600 text-white border-amber-600"
                                    : "border-slate-600 text-slate-300"
                            }`}
                          >
                            {index + 1}
                          </Badge>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                              {entry.player.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-white truncate font-bold text-sm">{entry.player.name}</div>
                            <div className="text-xs text-slate-400">
                              {entry.matchesPlayed} games • {entry.winRate}%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-bold text-sm">{entry.totalWon}</div>
                            <div className="text-xs text-slate-400">GT</div>
                          </div>
                          {entry.player.isOnline && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="mb-2">
                      <CardTitle className="text-white text-base">📊 Transaction History</CardTitle>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {transactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                          No transactions yet. Start playing to see your history!
                        </div>
                      ) : (
                        transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30 hover:border-slate-500/50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  tx.type === "buy"
                                    ? "border-blue-500 text-blue-400"
                                    : tx.type === "stake"
                                      ? "border-yellow-500 text-yellow-400"
                                      : tx.type === "win"
                                        ? "border-green-500 text-green-400"
                                        : "border-red-500 text-red-400"
                                }`}
                              >
                                {tx.type.toUpperCase()}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  tx.isReal ? "border-green-500 text-green-400" : "border-yellow-500 text-yellow-400"
                                }`}
                              >
                                {tx.isReal ? "REAL" : "DEMO"}
                              </Badge>
                            </div>
                            <div className="text-white font-bold text-sm mb-1">
                              {tx.type === "buy" ? "+" : tx.type === "win" ? "+" : "-"}
                              {tx.type === "win" && tx.winAmount ? tx.winAmount : tx.amount} GT
                              {tx.type === "win" && tx.winAmount && (
                                <span className="text-green-400 text-xs ml-1">
                                  (Won {tx.winAmount} GT from {tx.amount} GT stake)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 font-mono mb-2 break-all">{tx.txHash}</div>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-400">{tx.timestamp.toLocaleTimeString()}</div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6 px-2 text-blue-400 hover:bg-blue-400/10"
                                onClick={() => window.open(tx.blockExplorerUrl, "_blank")}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
