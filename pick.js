const fs = require("fs");
const base58 = require("bs58");
const chunk = require("chunk");
const { Keypair, Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { Wallet, Provider, Program, Idl } = require("@project-serum/anchor");
const idl = require("./target/idl/dracula_game.json");
const pda = require("./packages/sdk/dist/helpers/pda");
const constant = require("./packages/sdk/dist/helpers/constant");

function loadDraculaGameProgram(walletKeyPair, env) {
  const connection = new Connection(
    // clusterApiUrl(env)
    "https://fragrant-hidden-wildflower.solana-mainnet.quiknode.pro/989468182c0793b262d4984ac26d2e2d8358c45f"
  );

  const wallet = new Wallet(walletKeyPair);
  const provider = new Provider(connection, wallet, {
    preflightCommitment: "max",
  });

  return new Program(
    idl,
    constant.PROGRAM_ID,
    provider
  );
}

const program = loadDraculaGameProgram(Keypair.generate(), "mainnet-beta");

(async () => {
  // const data = await program.provider.connection.getProgramAccounts(
  //   program.programId,
  //   {
  //     dataSlice: { offset: 8, length: 64 },
  //     filters: [
  //       { dataSize: Math.ceil(program.account.human.size / 8) * 8 },
  //       { memcmp: { offset: 93, bytes: base58.encode([1]) } },
  //     ],
  //   }
  // );
  // let owners = data.map((item) => ({ user: base58.encode(item.account.data.slice(0, 32)), mint: base58.encode(item.account.data.slice(32, 64)) }));
  // const result = owners.reduce((acc, it) => {
  //   if (acc[it.user]) {
  //     acc[it.user].push(it.mint);
  //   } else {
  //     acc[it.user] = [it.mint];
  //   }
  //   return acc;
  // }, {});
  // let result = {};
  // for await (accounts of chunk(owners, 20)) {
  //   const pdas = await Promise.all(accounts.map(account => pda.getPlayerPda(new PublicKey(account.mint))));
  //   const players = await Promise.all(pdas.map(playerPda => program.account.player.fetch(playerPda)));
  //   const sets = players.reduce((acc, player, index) => {
  //     acc[accounts[index]] = player.totalVampires + player.totalHumans;
  //     return acc;
  //   }, {});
  //   result = { ...result, ...sets };
  // }
  // fs.writeFileSync("dumps/STAKERS.json", JSON.stringify(result));

  const data = JSON.parse(fs.readFileSync("/home/wantanabe/workspace/Dracula/dracula-game/dumps/mainnet-beta_1647445672451.json", { encoding: "utf8" }));
  const wallets = [];
  for await (item of data) {
    const pdas = await Promise.all(item.chunk.map((mint) => pda.getVampirePda(new PublicKey(mint))));
    const vampires = await Promise.all(pdas.map(vampirePda => program.account.vampire.fetch(vampirePda)));
    wallets.push(...vampires.map(vampire => vampire.user.toBase58()));
  }
  fs.writeFileSync("dumps/mainnet-beta_1647445672451_Vampires_GEN[0,1].json", JSON.stringify(wallets));
})()
