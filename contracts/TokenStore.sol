// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./GameToken.sol";

contract TokenStore is ReentrancyGuard {
    IERC20 public usdt;
    GameToken public gameToken;
    address public owner;
    
    // 1 USDT = 1e18 GT (1:1 ratio, accounting for decimals)
    uint256 public constant GT_PER_USDT = 1e18;
    
    event Purchase(address indexed buyer, uint256 usdtAmount, uint256 gtAmount);
    
    constructor(address _usdt, address _gameToken) {
        usdt = IERC20(_usdt);
        gameToken = GameToken(_gameToken);
        owner = msg.sender;
    }
    
    function buy(uint256 usdtAmount) external nonReentrant {
        require(usdtAmount > 0, "Amount must be greater than 0");
        
        // Calculate GT amount (1 USDT = 1 GT)
        uint256 gtAmount = usdtAmount * GT_PER_USDT / 1e6; // USDT has 6 decimals
        
        // Transfer USDT from user to contract
        require(usdt.transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        
        // Mint GT to user
        gameToken.mint(msg.sender, gtAmount);
        
        emit Purchase(msg.sender, usdtAmount, gtAmount);
    }
    
    function withdrawUSDT(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        usdt.transfer(to, amount);
    }
}
