// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CoinFlipGame is ReentrancyGuard {
    IERC20 public gameToken;
    address public backend;
    address public owner;
    
    enum Choice { HEADS, TAILS }
    enum Status { CREATED, STAKED, SETTLED, REFUNDED }
    
    struct Match {
        bytes32 matchId;
        address player1;
        address player2;
        Choice p1Choice;
        Choice p2Choice;
        uint256 stake;
        Status status;
        uint256 startTime;
        address winner;
    }
    
    mapping(bytes32 => Match) public matches;
    mapping(address => uint256) public totalWon;
    
    uint256 public constant TIMEOUT = 24 hours;
    
    event MatchCreated(bytes32 indexed matchId, address indexed player1, Choice choice, uint256 stake);
    event Staked(bytes32 indexed matchId, address indexed player);
    event Settled(bytes32 indexed matchId, address indexed winner, Choice winningChoice);
    event Refunded(bytes32 indexed matchId);
    
    constructor(address _gameToken) {
        gameToken = IERC20(_gameToken);
        owner = msg.sender;
    }
    
    function setBackend(address _backend) external {
        require(msg.sender == owner, "Only owner");
        backend = _backend;
    }
    
    function createMatch(bytes32 matchId, address p1, address p2, uint256 stake) external {
        require(msg.sender == backend, "Only backend");
        require(matches[matchId].matchId == bytes32(0), "Match already exists");
        
        matches[matchId] = Match({
            matchId: matchId,
            player1: p1,
            player2: p2,
            p1Choice: Choice.HEADS, // Will be set when staking
            p2Choice: Choice.TAILS, // Will be set when staking
            stake: stake,
            status: Status.CREATED,
            startTime: block.timestamp,
            winner: address(0)
        });
        
        emit MatchCreated(matchId, p1, Choice.HEADS, stake);
    }
    
    function stake(bytes32 matchId, Choice choice) external nonReentrant {
        Match storage match = matches[matchId];
        require(match.matchId != bytes32(0), "Match does not exist");
        require(match.status == Status.CREATED, "Match not in created state");
        require(msg.sender == match.player1 || msg.sender == match.player2, "Not a player in this match");
        
        // Transfer stake from player
        require(gameToken.transferFrom(msg.sender, address(this), match.stake), "Stake transfer failed");
        
        // Set player choice
        if (msg.sender == match.player1) {
            match.p1Choice = choice;
        } else {
            match.p2Choice = choice;
        }
        
        // Check if both players have staked
        if (gameToken.balanceOf(address(this)) >= match.stake * 2) {
            match.status = Status.STAKED;
            match.startTime = block.timestamp;
        }
        
        emit Staked(matchId, msg.sender);
    }
    
    function commitResult(bytes32 matchId, address winner) external {
        require(msg.sender == backend, "Only backend");
        Match storage match = matches[matchId];
        require(match.status == Status.STAKED, "Match not staked");
        require(winner == match.player1 || winner == match.player2, "Invalid winner");
        
        match.status = Status.SETTLED;
        match.winner = winner;
        
        // Transfer 2x stake to winner
        uint256 payout = match.stake * 2;
        require(gameToken.transfer(winner, payout), "Payout transfer failed");
        
        // Update total won
        totalWon[winner] += payout;
        
        Choice winningChoice = (winner == match.player1) ? match.p1Choice : match.p2Choice;
        emit Settled(matchId, winner, winningChoice);
    }
    
    function refund(bytes32 matchId) external {
        Match storage match = matches[matchId];
        require(match.matchId != bytes32(0), "Match does not exist");
        require(block.timestamp > match.startTime + TIMEOUT, "Timeout not reached");
        require(match.status == Status.STAKED, "Match not in staked state");
        
        match.status = Status.REFUNDED;
        
        // Refund both players
        require(gameToken.transfer(match.player1, match.stake), "Refund to player1 failed");
        require(gameToken.transfer(match.player2, match.stake), "Refund to player2 failed");
        
        emit Refunded(matchId);
    }
}
