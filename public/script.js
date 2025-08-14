// Web3 and Contract Setup
let provider, signer, userAddress
let gameTokenContract, tokenStoreContract, coinFlipGameContract
const ethers = window.ethers // Declare the ethers variable

// Contract addresses (update these after deployment)
const CONTRACTS = {
  GAME_TOKEN: "0x...", // Update with deployed address
  TOKEN_STORE: "0x...", // Update with deployed address
  COIN_FLIP_GAME: "0x...", // Update with deployed address
}

// Contract ABIs (simplified)
const ABIS = {
  GAME_TOKEN: [
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
  ],
  TOKEN_STORE: ["function buy(uint256 usdtAmount) external"],
  COIN_FLIP_GAME: ["function stake(bytes32 matchId, uint8 choice) external"],
}

// Game state
let currentMatch = null
let selectedChoice = null
const stakeAmount = 0

// DOM Elements
const connectWalletBtn = document.getElementById("connectWallet")
const walletInfo = document.getElementById("walletInfo")
const walletAddress = document.getElementById("walletAddress")
const gtBalance = document.getElementById("gtBalance")
const buyTokensBtn = document.getElementById("buyTokens")
const usdtAmountInput = document.getElementById("usdtAmount")
const choiceButtons = document.querySelectorAll(".choice-btn")
const stakeAmountInput = document.getElementById("stakeAmount")
const startGameBtn = document.getElementById("startGame")
const gameStatus = document.getElementById("gameStatus")
const matchInfo = document.getElementById("matchInfo")
const gameResult = document.getElementById("gameResult")

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  await checkWalletConnection()
  loadLeaderboard()

  // Event listeners
  connectWalletBtn.addEventListener("click", connectWallet)
  buyTokensBtn.addEventListener("click", buyTokens)
  startGameBtn.addEventListener("click", startGame)

  choiceButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => selectChoice(e.target.dataset.choice))
  })

  stakeAmountInput.addEventListener("input", validateGameSetup)

  document.getElementById("stakeTokens").addEventListener("click", stakeTokens)
  document.getElementById("playAgain").addEventListener("click", resetGame)
})

// Wallet functions
async function checkWalletConnection() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" })
      if (accounts.length > 0) {
        await connectWallet()
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }
}

async function connectWallet() {
  try {
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask to play this game!")
      return
    }

    await window.ethereum.request({ method: "eth_requestAccounts" })
    provider = new ethers.providers.Web3Provider(window.ethereum)
    signer = provider.getSigner()
    userAddress = await signer.getAddress()

    // Initialize contracts
    if (CONTRACTS.GAME_TOKEN !== "0x...") {
      gameTokenContract = new ethers.Contract(CONTRACTS.GAME_TOKEN, ABIS.GAME_TOKEN, signer)
      tokenStoreContract = new ethers.Contract(CONTRACTS.TOKEN_STORE, ABIS.TOKEN_STORE, signer)
      coinFlipGameContract = new ethers.Contract(CONTRACTS.COIN_FLIP_GAME, ABIS.COIN_FLIP_GAME, signer)
    }

    // Update UI
    connectWalletBtn.classList.add("hidden")
    walletInfo.classList.remove("hidden")
    walletAddress.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`

    await updateBalance()

    // Listen for account changes
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        location.reload()
      }
    })
  } catch (error) {
    console.error("Error connecting wallet:", error)
    alert("Failed to connect wallet. Please try again.")
  }
}

function disconnectWallet() {
  provider = null
  signer = null
  userAddress = null
  connectWalletBtn.classList.remove("hidden")
  walletInfo.classList.add("hidden")
}

async function updateBalance() {
  try {
    if (gameTokenContract && userAddress) {
      const balance = await gameTokenContract.balanceOf(userAddress)
      gtBalance.textContent = `${ethers.utils.formatEther(balance)} GT`
    } else {
      // Fallback to API call
      const response = await fetch(`/api/balance/${userAddress}`)
      const data = await response.json()
      gtBalance.textContent = `${data.balance} GT`
    }
  } catch (error) {
    console.error("Error updating balance:", error)
    gtBalance.textContent = "0 GT"
  }
}

// Token purchase
async function buyTokens() {
  try {
    const amount = Number.parseFloat(usdtAmountInput.value)
    if (!amount || amount <= 0) {
      alert("Please enter a valid USDT amount")
      return
    }

    if (!userAddress) {
      alert("Please connect your wallet first")
      return
    }

    buyTokensBtn.disabled = true
    buyTokensBtn.textContent = "Processing..."

    if (tokenStoreContract) {
      // Convert to USDT decimals (6)
      const usdtAmount = ethers.utils.parseUnits(amount.toString(), 6)
      const tx = await tokenStoreContract.buy(usdtAmount)
      await tx.wait()

      alert("Tokens purchased successfully!")
      await updateBalance()
    } else {
      // Fallback to API
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      const data = await response.json()
      alert(data.message)
    }

    usdtAmountInput.value = ""
  } catch (error) {
    console.error("Error buying tokens:", error)
    alert("Failed to buy tokens. Please try again.")
  } finally {
    buyTokensBtn.disabled = false
    buyTokensBtn.textContent = "Buy GT Tokens"
  }
}

// Game functions
function selectChoice(choice) {
  selectedChoice = choice
  choiceButtons.forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.choice === choice)
  })
  validateGameSetup()
}

function validateGameSetup() {
  const stake = Number.parseFloat(stakeAmountInput.value)
  const isValid = selectedChoice && stake > 0 && userAddress
  startGameBtn.disabled = !isValid
}

async function startGame() {
  try {
    const stake = Number.parseFloat(stakeAmountInput.value)

    if (!selectedChoice || !stake || !userAddress) {
      alert("Please select a choice and enter stake amount")
      return
    }

    startGameBtn.disabled = true
    startGameBtn.textContent = "Finding Match..."

    // Show game status
    document.querySelector(".game-setup").classList.add("hidden")
    gameStatus.classList.remove("hidden")

    const response = await fetch("/api/match/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerAddress: userAddress,
        choice: selectedChoice,
        stake: stake,
      }),
    })

    const data = await response.json()

    if (data.success) {
      if (data.waiting) {
        document.getElementById("statusTitle").textContent = "Waiting for opponent..."
        document.getElementById("statusMessage").textContent =
          "Please wait while we find a player with the opposite choice and same stake."

        // Poll for match updates
        pollForMatch()
      } else {
        // Match found immediately
        showMatchFound(data)
      }
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    console.error("Error starting game:", error)
    alert("Failed to start game. Please try again.")
    resetGame()
  }
}

function pollForMatch() {
  // In a real app, you'd use WebSockets for real-time updates
  // For now, we'll simulate finding a match after a delay
  setTimeout(() => {
    // Simulate match found
    const mockMatch = {
      matchId: "mock-match-" + Date.now(),
      opponent: "0x742d35Cc6634C0532925a3b8D0Ac6bc4ab60e1F1",
      message: "Match found! Both players need to stake tokens.",
    }
    showMatchFound(mockMatch)
  }, 3000)
}

function showMatchFound(matchData) {
  currentMatch = matchData

  document.getElementById("statusTitle").textContent = "Match Found!"
  document.getElementById("statusMessage").textContent = ""
  matchInfo.classList.remove("hidden")

  document.getElementById("matchId").textContent = matchData.matchId
  document.getElementById("opponentAddress").textContent =
    `${matchData.opponent.slice(0, 6)}...${matchData.opponent.slice(-4)}`
  document.getElementById("yourChoice").textContent = selectedChoice
  document.getElementById("matchStake").textContent = stakeAmountInput.value
}

async function stakeTokens() {
  try {
    if (!currentMatch || !coinFlipGameContract) {
      alert("Contract not available. Using simulation mode.")
      // Simulate staking and proceed to result
      setTimeout(showGameResult, 2000)
      return
    }

    const stakeBtn = document.getElementById("stakeTokens")
    stakeBtn.disabled = true
    stakeBtn.textContent = "Staking..."

    // Approve tokens first
    const stakeAmount = ethers.utils.parseEther(document.getElementById("matchStake").textContent)
    const approveTx = await gameTokenContract.approve(CONTRACTS.COIN_FLIP_GAME, stakeAmount)
    await approveTx.wait()

    // Stake tokens
    const choice = selectedChoice === "HEADS" ? 0 : 1
    const stakeTx = await coinFlipGameContract.stake("0x" + currentMatch.matchId, choice)
    await stakeTx.wait()

    stakeBtn.textContent = "Tokens Staked!"

    // Wait for game result
    setTimeout(showGameResult, 3000)
  } catch (error) {
    console.error("Error staking tokens:", error)
    alert("Failed to stake tokens. Please try again.")
    document.getElementById("stakeTokens").disabled = false
    document.getElementById("stakeTokens").textContent = "Stake Tokens"
  }
}

async function showGameResult() {
  try {
    if (!currentMatch) return

    // Get result from backend
    const response = await fetch(`/api/match/${currentMatch.matchId}/result`, {
      method: "POST",
    })

    const data = await response.json()

    if (data.success) {
      matchInfo.classList.add("hidden")
      gameResult.classList.remove("hidden")

      // Animate coin flip
      const coinElement = document.getElementById("coinResult")
      coinElement.style.animation = "flip 1s ease-in-out"

      setTimeout(() => {
        document.getElementById("flipResult").textContent = data.result

        const isWinner = data.winner.toLowerCase() === userAddress.toLowerCase()
        const winnerMsg = document.getElementById("winnerMessage")

        if (isWinner) {
          winnerMsg.innerHTML = `<strong style="color: #38a169;">🎉 You Won!</strong> You received ${stakeAmountInput.value * 2} GT`
        } else {
          winnerMsg.innerHTML = `<strong style="color: #e53e3e;">😔 You Lost</strong> Better luck next time!`
        }

        if (data.txHash) {
          const txLink = document.getElementById("transactionLink")
          txLink.classList.remove("hidden")
          txLink.querySelector("a").href = `https://etherscan.io/tx/${data.txHash}`
        }

        // Update balance
        updateBalance()
        loadLeaderboard()
      }, 1000)
    }
  } catch (error) {
    console.error("Error getting game result:", error)
    alert("Failed to get game result")
  }
}

function resetGame() {
  currentMatch = null
  selectedChoice = null

  // Reset UI
  document.querySelector(".game-setup").classList.remove("hidden")
  gameStatus.classList.add("hidden")
  matchInfo.classList.add("hidden")
  gameResult.classList.add("hidden")

  choiceButtons.forEach((btn) => btn.classList.remove("selected"))
  stakeAmountInput.value = ""
  startGameBtn.disabled = true
  startGameBtn.textContent = "Find Match"

  document.getElementById("stakeTokens").disabled = false
  document.getElementById("stakeTokens").textContent = "Stake Tokens"
}

// Leaderboard
async function loadLeaderboard() {
  try {
    const response = await fetch("/api/leaderboard")
    const leaderboard = await response.json()

    const leaderboardElement = document.getElementById("leaderboard")

    if (leaderboard.length === 0) {
      leaderboardElement.innerHTML = '<div class="loading">No players yet</div>'
      return
    }

    const leaderboardHTML = leaderboard
      .map(
        (player, index) => `
            <div class="leaderboard-item">
                <div>
                    <span class="rank">#${index + 1}</span>
                    <span class="address">${player.address.slice(0, 6)}...${player.address.slice(-4)}</span>
                </div>
                <span class="total-won">${player.totalWon} GT</span>
            </div>
        `,
      )
      .join("")

    leaderboardElement.innerHTML = leaderboardHTML
  } catch (error) {
    console.error("Error loading leaderboard:", error)
    document.getElementById("leaderboard").innerHTML = '<div class="loading">Failed to load leaderboard</div>'
  }
}

// Auto-refresh leaderboard every 30 seconds
setInterval(loadLeaderboard, 30000)
