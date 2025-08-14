# Blockchain Coin Flip Game - link : <a href="https://v0-blockchain-web-app.vercel.app/" target="_blank">Live Web App</a>

A full-stack blockchain-based coin flip betting game where players use GameTokens (GT) to bet on coin flip outcomes. Built with Solidity smart contracts, Node.js backend, and vanilla HTML/CSS/JavaScript frontend.

<a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
<a href="https://expressjs.com/" target="_blank"><img src="https://img.shields.io/badge/Express.js-black?style=for-the-badge&logo=express&color=grey" alt="Express.js" /></a>
<a href="https://docs.soliditylang.org/" target="_blank"><img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" /></a>
<a href="https://ethers.io/" target="_blank"><img src="https://img.shields.io/badge/Ethers.js-blue?style=for-the-badge&logo=ethers&logoColor=white" alt="Ethers.js" /></a>
<a href="https://www.w3.org/html/" target="_blank"><img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" /></a>
<a href="https://www.w3schools.com/css/" target="_blank"><img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" /></a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" /></a>

## youtube link

<a href="https://youtu.be/OX09eumvptQ" target="_blank">Video Explanation</a>


## 🎮 Game Features

- **Buy GameTokens**: Convert USDT to GT tokens at 1:1 ratio
- **Real-time Matchmaking**: Automatic pairing of players with opposite choices
- **Blockchain Escrow**: Smart contracts handle all token staking and payouts
- **Live Leaderboard**: Track top winners and game statistics
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Smart Contracts
- **GameToken.sol**: ERC-20 token contract for GT tokens
- **TokenStore.sol**: Handles USDT → GT conversion
- **CoinFlipGame.sol**: Manages game logic, escrow, and payouts

### Backend (Node.js)
- RESTful API for game operations
- Real-time matchmaking system
- Blockchain event listening
- In-memory leaderboard (SQLite ready)

### Frontend (Vanilla JS)
- MetaMask wallet integration
- Real-time game interface
- Responsive CSS design
- Web3 blockchain interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MetaMask browser extension
- Local blockchain (Hardhat/Ganache) or testnet access

### Installation

1. **Clone and install dependencies**
\`\`\`bash
git clone <repository-url>
cd blockchain-coinflip-game
npm install
\`\`\`

2. **Set up environment variables**
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

3. **Deploy smart contracts**
\`\`\`bash
# Start local blockchain (if using Hardhat)
npx hardhat node

# Deploy contracts
npm run deploy
# Update contract addresses in .env and public/script.js
\`\`\`

4. **Start the server**
\`\`\`bash
npm start
# or for development
npm run dev
\`\`\`

5. **Open the game**
Navigate to `http://localhost:3000`

## 🎯 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Buy Tokens**: Enter USDT amount and buy GT tokens
3. **Choose Side**: Select HEADS or TAILS for your bet
4. **Set Stake**: Enter the amount of GT tokens to bet
5. **Find Match**: System finds opponent with opposite choice and same stake
6. **Stake Tokens**: Both players stake their GT tokens into escrow
7. **Coin Flip**: Server generates random result and determines winner
8. **Get Payout**: Winner receives 2x stake amount automatically

## 🔧 Configuration

### Contract Addresses
Update these in both `.env` and `public/script.js` after deployment:
- `GAME_TOKEN_ADDRESS`
- `TOKEN_STORE_ADDRESS` 
- `COIN_FLIP_GAME_ADDRESS`

### Network Configuration
- **Local Development**: Use Hardhat local network
- **Testnet**: Configure RPC_URL for Goerli/Sepolia
- **Mainnet**: Use mainnet RPC and real USDT contract address

## 📊 API Endpoints

- `GET /api/balance/:address` - Get GT token balance
- `POST /api/purchase` - Buy GT tokens with USDT
- `POST /api/match/start` - Create or join a match
- `GET /api/match/:matchId` - Get match status
- `POST /api/match/:matchId/result` - Submit match result
- `GET /api/leaderboard` - Get top players
- `GET /api/waiting` - Get waiting players (debug)

## 🔒 Security Features

- **Reentrancy Protection**: All contracts use OpenZeppelin's ReentrancyGuard
- **Access Control**: Backend-only functions for game results
- **Timeout Refunds**: Players can claim refunds after 24 hours
- **Double-spend Prevention**: Proper escrow and state management

## 🧪 Testing

### Smart Contract Tests
\`\`\`bash
npx hardhat test
\`\`\`

### Manual Testing Checklist
- [ ] Wallet connection works
- [ ] Token purchase updates balance
- [ ] Matchmaking pairs opposite choices
- [ ] Staking locks tokens in escrow
- [ ] Coin flip generates random results
- [ ] Winner receives correct payout
- [ ] Leaderboard updates properly
- [ ] Refunds work after timeout

## 🚀 Deployment

### Local Development
1. Run `npx hardhat node`
2. Deploy contracts with `npm run deploy`
3. Start server with `npm start`

### Production Deployment
1. Deploy contracts to mainnet/testnet
2. Update environment variables
3. Deploy backend to Vercel/Heroku
4. Serve frontend from CDN or static hosting

## 📝 Game Rules

- Both players must stake exactly the same GT amount
- Coin flip is 50/50 chance, decided server-side
- Winner gets 2× stake GT directly from contract
- If no result within 24 hours, both players get refunds
- All transactions are recorded on blockchain

## 🛠️ Technology Stack

- **Smart Contracts**: Solidity, OpenZeppelin, Hardhat
- **Backend**: Node.js, Express, Ethers.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Blockchain**: Ethereum, MetaMask integration
- **Storage**: In-memory (SQLite ready)

## 📈 Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] Multiple game modes (dice, cards, etc.)
- [ ] Tournament system with brackets
- [ ] NFT rewards for top players
- [ ] Mobile app with React Native
- [ ] Layer 2 integration for lower fees

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## ⚠️ Disclaimer

<h2>Screenshots</h2>

<a href="/imagess/Screenshot 2025-08-14 154002.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154002.png" alt="Screenshot 2025-08-14 15:40:02" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154014.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154014.png" alt="Screenshot 2025-08-14 15:40:14" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154039.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154039.png" alt="Screenshot 2025-08-14 15:40:39" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154047.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154047.png" alt="Screenshot 2025-08-14 15:40:47" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154059.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154059.png" alt="Screenshot 2025-08-14 15:40:59" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154105.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154105.png" alt="Screenshot 2025-08-14 15:41:05" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154117.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154117.png" alt="Screenshot 2025-08-14 15:41:17" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154135.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154135.png" alt="Screenshot 2025-08-14 15:41:35" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154148.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154148.png" alt="Screenshot 2025-08-14 15:41:48" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154446.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154446.png" alt="Screenshot 2025-08-14 15:44:46" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154452.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154452.png" alt="Screenshot 2025-08-14 15:44:52" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154458.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154458.png" alt="Screenshot 2025-08-14 15:44:58" width="300">
</a>
<a href="/imagess/Screenshot 2025-08-14 154507.png" target="_blank">
  <img src="/imagess/Screenshot 2025-08-14 154507.png" alt="Screenshot 2025-08-14 15:45:07" width="300">
</a>
<a href="/imagess/v0-blockchain-web-app.vercel.app_.png" target="_blank">
  <img src="/imagess/v0-blockchain-web-app.vercel.app_.png" alt="Deployed App Preview" width="300">
</a>

<h2>System Architecture</h2>

<a href="https://v0-blockchain-web-app.vercel.app/" target="_blank">
  <img src="/imagess/1.png" alt="Screenshot 1" width="300">
</a>
<a href="https://v0-blockchain-web-app.vercel.app/" target="_blank">
  <img src="/imagess/2.png" alt="Screenshot 2" width="300">
</a>
<a href="https://v0-blockchain-web-app.vercel.app/" target="_blank">
  <img src="/imagess/3.png" alt="Screenshot 3" width="300">
</a>
