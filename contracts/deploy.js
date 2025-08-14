const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying contracts...")

  // Get deployer account
  const [deployer] = await ethers.getSigners()
  console.log("Deploying with account:", deployer.address)

  // Deploy GameToken
  const GameToken = await ethers.getContractFactory("GameToken")
  const gameToken = await GameToken.deploy()
  await gameToken.waitForDeployment()
  console.log("GameToken deployed to:", await gameToken.getAddress())

  // Deploy TokenStore (using a mock USDT address for demo)
  const mockUSDT = "0x1234567890123456789012345678901234567890" // Replace with actual USDT address
  const TokenStore = await ethers.getContractFactory("TokenStore")
  const tokenStore = await TokenStore.deploy(mockUSDT, await gameToken.getAddress())
  await tokenStore.waitForDeployment()
  console.log("TokenStore deployed to:", await tokenStore.getAddress())

  // Deploy CoinFlipGame
  const CoinFlipGame = await ethers.getContractFactory("CoinFlipGame")
  const coinFlipGame = await CoinFlipGame.deploy(await gameToken.getAddress())
  await coinFlipGame.waitForDeployment()
  console.log("CoinFlipGame deployed to:", await coinFlipGame.getAddress())

  // Set TokenStore in GameToken
  await gameToken.setTokenStore(await tokenStore.getAddress())
  console.log("TokenStore set in GameToken")

  // Set backend address in CoinFlipGame (replace with actual backend address)
  const backendAddress = deployer.address // For demo, using deployer as backend
  await coinFlipGame.setBackend(backendAddress)
  console.log("Backend address set in CoinFlipGame")

  console.log("\nDeployment completed!")
  console.log("Contract addresses:")
  console.log("GameToken:", await gameToken.getAddress())
  console.log("TokenStore:", await tokenStore.getAddress())
  console.log("CoinFlipGame:", await coinFlipGame.getAddress())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
