pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract Life {
  using SafeMath for uint256;

  mapping(address => uint256) public health;
  mapping(address => uint256) public lastActionTimestamp;

  function spawn() payable public {
    require(msg.value == 1 ether);
    health[msg.sender] = 10;
    address(0).transfer(msg.value);
  }

  function isAlive(address x) public view returns (bool) {
    return health[x] > 0;
  }

  modifier cooldown() {
    require(now - lastActionTimestamp[msg.sender] > 1 days);
    _;
    lastActionTimestamp[msg.sender] = now;
  }

  function hit(address victim) cooldown public {
    require(isAlive(msg.sender));
    health[victim] = health[victim].sub(1); 
  }

  function heal(address friend) cooldown public {
    require(isAlive(msg.sender));
    require(health[friend] < 10);
    health[friend] = health[friend].add(1); 
    lastActionTimestamp[msg.sender] = now;
  }
}

