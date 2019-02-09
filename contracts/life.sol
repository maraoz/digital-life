pragma solidity ^0.5.2;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract Life {
  using SafeMath for uint256;

  mapping(address => uint256) public health;

  function spawn() payable public {
    require(msg.value == 1 ether);
    health[msg.sender] = 10;
    address(0).transfer(msg.value);
  }

  function hit(address victim) public {
    health[victim] = health[victim].sub(1); 
  }

  function heal(address friend) public {
    require(health[friend] < 10);
    health[friend] = health[friend].add(1); 
  }
}

