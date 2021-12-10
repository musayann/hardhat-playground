const chai = require("chai");
const BN = require("bn.js");

// const BigNumber = require("big-number");

// Enable and inject BN dependency
chai.use(require("chai-bn")(BN));

const { expect } = chai;
const { ethers } = require("hardhat");

describe("NDToken", function () {
  let Token, token, owner, addr1, addr2;
  const tokenName = "Test token";
  const tokenSymbol = "TST";

  beforeEach(async () => {
    Token = await ethers.getContractFactory("NDToken");
    token = await Token.deploy(tokenName, tokenSymbol);
    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe("Deployment", () => {
    it("Should set have the right name", async () => {
      expect(await token.name()).to.equal(tokenName);
    });

    it("Should assign the total supply of tokens to the owner", async () => {
      const ownerBalance = await token.balanceOf(owner.address);
      expect(await token.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      await token.transfer(addr1.address, 50);
      const addr1Balance = await token.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(50);
    });

    it("Should fail if not enough tokens", async () => {
      const initialOwnerBalance = await token.balanceOf(owner.address);
      await expect(
        token.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await token.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
  it("Should update balances after transfers", async () => {
    const initialOwnerBalance = await token.balanceOf(owner.address);

    await token.transfer(addr1.address, 100);
    await token.transfer(addr2.address, 50);

    const finalOwnerBalance = await token.balanceOf(owner.address);
    // console.log(ethers.utils.parseEther(finalOwnerBalance))
    const newBalance = new BN(String(initialOwnerBalance)).sub(new BN(150));

    expect(String(finalOwnerBalance)).to.be.bignumber.equal(newBalance);

    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(100);

    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(50);
  });
});
