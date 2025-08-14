<div align="center">

🎮 Blockchain Coin Flip Game
A full-stack blockchain-based coin flip betting game where players use GameTokens (GT) to bet on coin flip outcomes.

Built with
<a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
<a href="https://expressjs.com/" target="_blank"><img src="https://img.shields.io/badge/Express.js-black?style=for-the-badge&logo=express&color=grey" alt="Express.js" /></a>
<a href="https://docs.soliditylang.org/" target="_blank"><img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" /></a>
<a href="https://ethers.io/" target="_blank"><img src="https://img.shields.io/badge/Ethers.js-blue?style=for-the-badge&logo=ethers&logoColor=white" alt="Ethers.js" /></a>
<a href="https://www.w3.org/html/" target="_blank"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" /></a>
<a href="https://www.w3schools.com/css/" target="_blank"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" /></a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>

</div>

📑 Table of Contents
Game Features

Architecture

Quick Start

Prerequisites

Installation

Usage

How to Play

Configuration

API Endpoints

Security Features

Testing

Deployment

Game Rules

Technology Stack

Future Enhancements

Contributing

License

Disclaimer

🎮 Game Features
Buy GameTokens: Convert USDT to GT tokens at 1:1 ratio.

Real-time Matchmaking: Automatic pairing of players with opposite choices.

Blockchain Escrow: Smart contracts handle all token staking and payouts.

Live Leaderboard: Track top winners and game statistics.

Responsive Design: Works on desktop and mobile devices.

🏗️ Architecture
Smart Contracts
GameToken.sol: ERC-20 token contract for GT tokens.

TokenStore.sol: Handles USDT → GT conversion.

CoinFlipGame.sol: Manages game logic, escrow, and payouts.

Backend (Node.js)
RESTful API for game operations.

Real-time matchmaking system.

Blockchain event listening.

In-memory leaderboard (SQLite ready).

Frontend (Vanilla JS)
MetaMask wallet integration.

Real-time game interface.

Responsive CSS design.

Web3 blockchain interactions.

🚀 Quick Start
Prerequisites
Node.js 16+

MetaMask browser extension

Local blockchain (Hardhat/Ganache) or testnet access

Installation
Clone and install dependencies

git clone <repository-url>
cd blockchain-coinflip-game
npm install

Set up environment variables

cp .env.example .env
# Edit .env with your configuration

Deploy smart contracts

# Start local blockchain (if using Hardhat)
npx hardhat node

# Deploy contracts
npm run deploy
# Update contract addresses in .env and public/script.js

Start the server

npm start
# or for development
npm run dev

Open the game
Navigate to http://localhost:3000

🎯 How to Play
Connect Wallet: Click "Connect Wallet" and approve MetaMask connection.

Buy Tokens: Enter USDT amount and buy GT tokens.

Choose Side: Select HEADS or TAILS for your bet.

Set Stake: Enter the amount of GT tokens to bet.

Find Match: System finds opponent with opposite choice and same stake.

Stake Tokens: Both players stake their GT tokens into escrow.

Coin Flip: Server generates random result and determines winner.

Get Payout: Winner receives 2x stake amount automatically.

🔧 Configuration
Contract Addresses
Update these in both .env and public/script.js after deployment:

GAME_TOKEN_ADDRESS

TOKEN_STORE_ADDRESS

COIN_FLIP_GAME_ADDRESS

Network Configuration
Local Development: Use Hardhat local network.

Testnet: Configure RPC_URL for Goerli/Sepolia.

Mainnet: Use mainnet RPC and real USDT contract address.

📊 API Endpoints
GET /api/balance/:address - Get GT token balance.

POST /api/purchase - Buy GT tokens with USDT.

POST /api/match/start - Create or join a match.

GET /api/match/:matchId - Get match status.

POST /api/match/:matchId/result - Submit match result.

GET /api/leaderboard - Get top players.

GET /api/waiting - Get waiting players (debug).

🔒 Security Features
Reentrancy Protection: All contracts use OpenZeppelin's ReentrancyGuard.

Access Control: Backend-only functions for game results.

Timeout Refunds: Players can claim refunds after 24 hours.

Double-spend Prevention: Proper escrow and state management.

🧪 Testing
Smart Contract Tests
npx hardhat test

Manual Testing Checklist
[ ] Wallet connection works

[ ] Token purchase updates balance

[ ] Matchmaking pairs opposite choices

[ ] Staking locks tokens in escrow

[ ] Coin flip generates random results

[ ] Winner receives correct payout

[ ] Leaderboard updates properly

[ ] Refunds work after timeout

🚀 Deployment
Local Development
Run npx hardhat node

Deploy contracts with npm run deploy

Start server with npm start

Production Deployment
Deploy contracts to mainnet/testnet.

Update environment variables.

Deploy backend to Vercel/Heroku.

Serve frontend from CDN or static hosting.

📝 Game Rules
Both players must stake exactly the same GT amount.

Coin flip is a 50/50 chance, decided server-side.

Winner gets 2x stake GT directly from the contract.

If no result within 24 hours, both players get refunds.

All transactions are recorded on the blockchain.

🛠️ Technology Stack
Smart Contracts: Solidity, OpenZeppelin, Hardhat

Backend: Node.js, Express, Ethers.js

Frontend: HTML5, CSS3, Vanilla JavaScript

Blockchain: Ethereum, MetaMask integration

Storage: In-memory (SQLite ready)

📈 Future Enhancements
[ ] WebSocket integration for real-time updates.

[ ] Multiple game modes (dice, cards, etc.).

[ ] Tournament system with brackets.

[ ] NFT rewards for top players.

[ ] Mobile app with React Native.

[ ] Layer 2 integration for lower fees.

🤝 Contributing
Fork the repository.

Create a feature branch (git checkout -b feature/amazing-feature).

Commit changes (git commit -m 'Add amazing feature').

Push to branch (git push origin feature/amazing-feature).

Open a Pull Request.

⚠️ Disclaimer
This is a demonstration project for educational purposes. Use at your own risk. Always audit smart contracts before deploying to mainnet with real funds.
