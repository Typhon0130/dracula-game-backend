import { program } from "commander";
import log, { LogLevelDesc } from "loglevel";
import {
  createGame,
  createGen,
  inspectHuman,
  inspectVampire,
  refreshVampires,
} from "./helpers/actions";
import {
  createLotteryPool,
  refreshLotteryPool,
  resetLotteryVault,
  distributeLotteryReward,
} from "./helpers/lottery";

program.version("0.1.0");
log.setLevel("info");

function setLogLevel(value: string) {
  if (value === undefined || value === null) {
    return;
  }
  log.info("setting the log value to: " + value);
  log.setLevel(value as LogLevelDesc);
}

function programCommand(name: string) {
  return program
    .command(name)
    .option(
      "-e, --env <string>",
      "Solana cluster env name",
      "devnet" // mainnet-beta, testnet, devnet
    )
    .option("-u, --custom-rpc-url <string>", "Custom RPC url")
    .option(
      "-k, --keypair <path>",
      `Solana wallet location`,
      "--keypair not provided"
    )
    .option("-l, --log-level <string>", "log level", setLogLevel);
}

programCommand("create-game")
  .requiredOption("-ak, --admin-keypair <string>", "admin keypair")
  .requiredOption("-ma, --mint-account <string>", "reward mint address")
  .requiredOption("-ba, --bot-account <string>", "bot address")
  .description("initialize game")
  .action(async (directory, cmd) => {
    const {
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      mintAccount,
      botAccount,
    } = cmd.opts();

    await createGame(
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      mintAccount,
      botAccount
    );
  });

programCommand("create-gen")
  .requiredOption("-ak, --admin-keypair <string>", "admin keypair")
  .requiredOption("--index <number>", "Gen index")
  .requiredOption("--path <string>", "NFT mint whitlist file path")
  .option("--tree-only", "Generate merkle tree only")
  .option("--create-flag", "Create or update flag")
  .description("create merkle tree for given Gen")
  .action(async (directory, cmd) => {
    const {
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      index,
      path,
      treeOnly,
      createFlag,
    } = cmd.opts();

    await createGen(
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      index,
      path,
      treeOnly,
      createFlag
    );
  });

programCommand("create-lottery-pool")
  .requiredOption("-ak, --admin-keypair <string>", "admin keypair")
  .requiredOption("-ma, --mint-account <string>", "reward mint address")
  .requiredOption("-ba, --bot-account <string>", "bot address")
  .description("create lottery pool")
  .action(async (directory, cmd) => {
    const {
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      mintAccount,
      botAccount,
    } = cmd.opts();

    await createLotteryPool(
      keypair,
      env,
      customRpcUrl,
      adminKeypair,
      mintAccount,
      botAccount
    );
  });

programCommand("refresh-lottery-pool")
  .requiredOption("-bk, --bot-keypair <string>", "bot keypair")
  .requiredOption("--start-time <string>", "start time")
  .requiredOption("--end-time <string>", "end time")
  .description("refresh lottery pool")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, botKeypair, startTime, endTime } =
      cmd.opts();

    await refreshLotteryPool(
      keypair,
      env,
      customRpcUrl,
      botKeypair,
      startTime,
      endTime
    );
  });

programCommand("reset-lottery-vault")
  .requiredOption("-bk, --bot-keypair <string>", "bot keypair")
  .requiredOption("-ma, --mint-account <string>", "BLOOD mint")
  .description("reset lottery vault")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, botKeypair, mintAccount } = cmd.opts();

    await resetLotteryVault(
      keypair,
      env,
      customRpcUrl,
      botKeypair,
      mintAccount
    );
  });

programCommand("distribute-lottery-reward")
  .requiredOption("-bk, --bot-keypair <string>", "bot keypair")
  .requiredOption("-ma, --mint-account <string>", "BLOOD mint")
  .description("distribute lottery reward")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, botKeypair, mintAccount } = cmd.opts();

    await distributeLotteryReward(
      keypair,
      env,
      customRpcUrl,
      botKeypair,
      mintAccount
    );
  });

programCommand("refresh-vampires")
  .requiredOption("-bk, --bot-keypair <string>", "bot keypair")
  .description("distribute rewards to vampires")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, botKeypair } = cmd.opts();

    await refreshVampires(keypair, env, customRpcUrl, botKeypair);
  });

programCommand("inspect-human")
  .requiredOption("-ma, --mint-account <string>", "NFT mint address")
  .description("inspect human reserve state")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, mintAccount } = cmd.opts();

    await inspectHuman(keypair, env, customRpcUrl, mintAccount);
  });

programCommand("inspect-vampire")
  .requiredOption("-ma, --mint-account <string>", "NFT mint address")
  .description("inspect vampire reserve state")
  .action(async (directory, cmd) => {
    const { keypair, env, customRpcUrl, mintAccount } = cmd.opts();

    await inspectVampire(keypair, env, customRpcUrl, mintAccount);
  });

program.parse(process.argv);
