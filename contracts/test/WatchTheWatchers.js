const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WatchTheWatchers Smart Contract", function () {
  let WatchTheWatchers;
  let contract;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    WatchTheWatchers = await ethers.getContractFactory("WatchTheWatchers");
    contract = await WatchTheWatchers.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should initialize with zero systems", async function () {
      expect(await contract.getSystemCount()).to.equal(0);
    });
  });

  describe("Surveillance System Registration", function () {
    it("Should register a new camera system", async function () {
      await contract.registerSystem(
        "SYS-FR-701",
        "Sector 7 Bio-Metric Scanner",
        "Facial Recognition",
        "District 7 Main Transit Hub",
        10
      );

      expect(await contract.getSystemCount()).to.equal(1);

      const sys = await contract.getSystem("SYS-FR-701");
      expect(sys.id).to.equal("SYS-FR-701");
      expect(sys.name).to.equal("Sector 7 Bio-Metric Scanner");
      expect(sys.systemType).to.equal("Facial Recognition");
      expect(sys.threatScore).to.equal(10);
      expect(sys.reporter).to.equal(owner.address);
      expect(sys.flags).to.equal(0);
      expect(sys.challenged).to.equal(false);
      expect(sys.active).to.equal(true);
    });

    it("Should fail if system ID is already registered", async function () {
      await contract.registerSystem(
        "SYS-FR-701",
        "Sector 7 Bio-Metric Scanner",
        "Facial Recognition",
        "District 7 Main Transit Hub",
        10
      );

      await expect(
        contract.registerSystem(
          "SYS-FR-701",
          "Duplicate Scanner",
          "CCTV",
          "District 7",
          5
        )
      ).to.be.revertedWith("SYSTEM ID ALREADY REGISTERED ON-CHAIN.");
    });

    it("Should fail if threat score is greater than 10", async function () {
      await expect(
        contract.registerSystem(
          "SYS-FR-701",
          "Invalid Scanner",
          "Facial Recognition",
          "District 7",
          11
        )
      ).to.be.revertedWith("THREAT SCORE CANNOT EXCEED 10.");
    });
  });

  describe("Flagging and Voting System", function () {
    beforeEach(async function () {
      await contract.registerSystem(
        "SYS-FR-701",
        "Sector 7 Bio-Metric Scanner",
        "Facial Recognition",
        "District 7 Main Transit Hub",
        10
      );
    });

    it("Should allow citizen wallets to flag a system", async function () {
      // Flag using addr1
      await contract.connect(addr1).flagSystem("SYS-FR-701");
      let sys = await contract.getSystem("SYS-FR-701");
      expect(sys.flags).to.equal(1);
      expect(await contract.hasFlagged(0, addr1.address)).to.equal(true);

      // Flag using addr2
      await contract.connect(addr2).flagSystem("SYS-FR-701");
      sys = await contract.getSystem("SYS-FR-701");
      expect(sys.flags).to.equal(2);
      expect(await contract.hasFlagged(0, addr2.address)).to.equal(true);
    });

    it("Should prevent duplicate flags from the same wallet address", async function () {
      await contract.connect(addr1).flagSystem("SYS-FR-701");
      await expect(
        contract.connect(addr1).flagSystem("SYS-FR-701")
      ).to.be.revertedWith("ALREADY FLAGGED BY THIS WALLET ACCOUNT.");
    });

    it("Should auto-challenge the system if flags reach threshold (5 flags)", async function () {
      const signers = await ethers.getSigners();
      
      // Send flags from 5 different accounts (signers 1 to 5)
      for (let i = 1; i <= 5; i++) {
        await contract.connect(signers[i]).flagSystem("SYS-FR-701");
      }

      const sys = await contract.getSystem("SYS-FR-701");
      expect(sys.flags).to.equal(5);
      expect(sys.challenged).to.equal(true);
    });
  });

  describe("Challenging Surveillance", function () {
    beforeEach(async function () {
      await contract.registerSystem(
        "SYS-FR-701",
        "Sector 7 Bio-Metric Scanner",
        "Facial Recognition",
        "District 7 Main Transit Hub",
        10
      );
    });

    it("Should allow the reporter to challenge their system without flags", async function () {
      await contract.challengeSystem("SYS-FR-701");
      const sys = await contract.getSystem("SYS-FR-701");
      expect(sys.challenged).to.equal(true);
    });

    it("Should prevent non-reporters from challenging systems with zero flags", async function () {
      await expect(
        contract.connect(addr1).challengeSystem("SYS-FR-701")
      ).to.be.revertedWith("INSUFFICIENT BASIS TO CHALLENGE.");
    });

    it("Should allow non-reporters to challenge once flagged", async function () {
      await contract.connect(addr2).flagSystem("SYS-FR-701");
      await contract.connect(addr1).challengeSystem("SYS-FR-701");
      const sys = await contract.getSystem("SYS-FR-701");
      expect(sys.challenged).to.equal(true);
    });
  });
});
