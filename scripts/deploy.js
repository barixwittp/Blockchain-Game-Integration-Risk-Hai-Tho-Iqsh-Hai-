const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying contracts...")

  // Deploy GameToken
  const GameToken = await ethers.getContractFactory("GameToken")
  const gameToken = await GameToken.deploy()
  await gameToken.waitForDeployment()
  console.log("GameToken deployed to:", await gameToken.getAddress())

  // Deploy TokenStore (using mock USDT address)
  const mockUSDT = "0x1234567890123456789012345678901234567890" // Replace with real USDT
  const TokenStore = await ethers.getContractFactory("TokenStore")
  const tokenStore = await TokenStore.deploy(mockUSDT, await gameToken.getAddress())
  await tokenStore.waitForDeployment()
  console.log("TokenStore deployed to:", await tokenStore.getAddress())

  // Deploy CoinFlipGame
  const CoinFlipGame = await ethers.getContractFactory("CoinFlipGame")
  const coinFlipGame = await CoinFlipGame.deploy(await gameToken.getAddress())
  await coinFlipGame.waitForDeployment()
  console.log("CoinFlipGame deployed to:", await coinFlipGame.getAddress())

  // Set TokenStore as minter
  await gameToken.transferOwnership(await tokenStore.getAddress())
  console.log("GameToken ownership transferred to TokenStore")

  console.log("\nDeployment complete!")
  console.log("Update your environment variables:")
  console.log(`GAME_TOKEN_ADDRESS=${await gameToken.getAddress()}`)
  console.log(`TOKEN_STORE_ADDRESS=${await tokenStore.getAddress()}`)
  console.log(`COIN_FLIP_GAME_ADDRESS=${await coinFlipGame.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
