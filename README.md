# Blockchain Coin Flip Game

A full-stack blockchain-based coin flip betting game where players use GameTokens (GT) to bet on coin flip outcomes. Built with Solidity smart contracts, Node.js backend, and vanilla HTML/CSS/JavaScript frontend.

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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a demonstration project for educational purposes. Use at your own risk. Always audit smart contracts before deploying to mainnet with real funds.
