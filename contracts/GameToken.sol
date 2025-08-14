// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameToken is ERC20, Ownable {
    address public tokenStore;
    
    constructor() ERC20("GameToken", "GT") Ownable(msg.sender) {
        // 18 decimals by default
    }
    
    function setTokenStore(address _tokenStore) external onlyOwner {
        tokenStore = _tokenStore;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == tokenStore, "Only TokenStore can mint");
        _mint(to, amount);
    }
    
    event Minted(address indexed to, uint256 amount);
}
