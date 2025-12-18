// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    address public owner;
    string public votingTopic;
    
    uint256 public startTime;
    uint256 public endTime;
    
    uint256 public votesFor;
    uint256 public votesAgainst;
    
    mapping(address => bool) public hasVoted;
    
    event Voted(address indexed voter, bool choice, uint256 timestamp);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier votingActive() {
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Voting is not active");
        _;
    }
    
    constructor(string memory _topic, uint256 _durationMinutes) {
        owner = msg.sender;
        votingTopic = _topic;
        startTime = block.timestamp;
        endTime = block.timestamp + (_durationMinutes * 1 minutes);
    }
    
    function vote(bool _choice) external votingActive {
        require(!hasVoted[msg.sender], "You have already voted");
        
        hasVoted[msg.sender] = true;
        
        if (_choice) {
            votesFor++;
        } else {
            votesAgainst++;
        }
        
        emit Voted(msg.sender, _choice, block.timestamp);
    }
    
    // VIEW FUNCTIONS
    function getVotes() public view returns (uint256 forVotes, uint256 againstVotes) {
        return (votesFor, votesAgainst);
    }
    
    function getVotingStatus() public view returns (bool active, uint256 timeLeft) {
        bool isActive = (block.timestamp >= startTime && block.timestamp <= endTime);
        uint256 remaining = 0;
        if (block.timestamp < endTime) {
            remaining = endTime - block.timestamp;
        }
        return (isActive, remaining);
    }
}
