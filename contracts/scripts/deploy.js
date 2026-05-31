const hre = require("hardhat");

async function main() {
  console.log("=========================================");
  console.log("DEPOLYING WATCHTHEWATCHERS SMART CONTRACT...");
  console.log("=========================================");

  const WatchTheWatchers = await hre.ethers.getContractFactory("WatchTheWatchers");
  const contract = await WatchTheWatchers.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ CONTRACT DEPLOYED SUCCESSFULLY.`);
  console.log(`📍 ADDRESS: ${address}`);
  console.log("=========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
