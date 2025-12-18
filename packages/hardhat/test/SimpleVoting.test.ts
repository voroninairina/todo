import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleVoting } from "../typechain-types";

describe("SimpleVoting", function () {
  let voting: SimpleVoting;
  let owner: any;
  let voter1: any;
  let voter2: any;

  beforeEach(async function () {
    [owner, voter1, voter2] = await ethers.getSigners();

    const VotingFactory = await ethers.getContractFactory("SimpleVoting");
    voting = await VotingFactory.deploy("Test Voting", 60);
    await voting.waitForDeployment(); //await voting.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should set the correct voting topic", async function () {
      expect(await voting.votingTopic()).to.equal("Test Voting");
    });
  });

  describe("Voting", function () {
    it("Should allow voting and emit Voted event", async function () {
      // Простой вариант - проверяем только что событие emit'ится с правильными аргументами кроме timestamp
      await expect(voting.connect(voter1).vote(true)).to.emit(voting, "Voted").withArgs(voter1.address, true); // Не проверяем timestamp, так как он может меняться
    });

    it("Should prevent double voting", async function () {
      await voting.connect(voter1).vote(true);
      await expect(voting.connect(voter1).vote(false)).to.be.revertedWith("You have already voted");
    });

    it("Should count votes correctly", async function () {
      await voting.connect(voter1).vote(true);
      await voting.connect(voter2).vote(false);

      const votes = await voting.getVotes();
      expect(votes[0]).to.equal(1); // votesFor
      expect(votes[1]).to.equal(1); // votesAgainst
    });
  });
});
