const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { run } = require("hardhat");
const {Group} = require("@semaphore-protocol/group");
const {Identity} = require("@semaphore-protocol/identity");
const {generateProof} = require("@semaphore-protocol/proof");
const packageJson = require("../package.json");
const config = packageJson.config;

// import { Group } from "@semaphore-protocol/group"
// import { Identity } from "@semaphore-protocol/identity"
// import { generateProof } from "@semaphore-protocol/proof"


describe("ReputationCenter", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  // async function deployOneYearLockFixture() {
  //   const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  //   const ONE_GWEI = 1_000_000_000;

  //   const lockedAmount = ONE_GWEI;
  //   const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

  //   // Contracts are deployed using the first signer/account by default
  //   const [owner, otherAccount] = await ethers.getSigners();

  //   const Lock = await ethers.getContractFactory("Lock");
  //   const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

  //   return { lock, unlockTime, lockedAmount, owner, otherAccount };
  // }

  describe("Deployment", function () {

    let mockERC20;
    let reputationCenter;
    let erc20WealthHook;
    const wasmFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.wasm`
    const zkeyFilePath = `${config.paths.build["snark-artifacts"]}/semaphore.zkey`


    const groupId = "1";
    const group = new Group(groupId);
    const users = [];

    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {

      const { semaphore } = await run("deploy:semaphore", {
        logs: false
      });

      console.log("Semaphore Address: ", semaphore.address);

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      const ReputationCenter = await ethers.getContractFactory("ReputationCenter");
      const ERC20WealthHook = await ethers.getContractFactory("ERC20WealthHook");

      mockERC20 = await MockERC20.deploy();
      console.log("MockERC20 Address: ", mockERC20.address);
      reputationCenter = await ReputationCenter.deploy(semaphore.address, "");
      erc20WealthHook = await ERC20WealthHook.deploy(mockERC20.address, "100" + "0".repeat(18));
      await reputationCenter.createReputationGroup(1, erc20WealthHook.address);

      [owner, addr1, addr2] = await ethers.getSigners();

      users.push(new Identity())
      users.push(new Identity())
    });

    it("With enough tokens can join group", async function () {
      await reputationCenter.joinReputationGroup(1, users[0].commitment, "0x");
      console.log(owner.address);
      console.log(
        (await reputationCenter.balanceOf(owner.address, groupId)).toString()
      );
      group.addMember(users[0].commitment);

      const fullProof = await generateProof(users[0], group, groupId, groupId, {
          wasmFilePath,
          zkeyFilePath
      });

      await reputationCenter.connect(addr2).exportReputation(groupId, fullProof.merkleTreeRoot, fullProof.nullifierHash, fullProof.proof);
      console.log(
        (await reputationCenter.balanceOf(addr2.address, groupId)).toString()
      );
    });

    it("Without enough tokens cannot join group", async function () {
      await expect(reputationCenter.connect(addr1).joinReputationGroup(1, users[0].commitment, "0x")).to.be.revertedWith("not enough tokens");
    });

  });
});
