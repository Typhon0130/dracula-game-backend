import log from "loglevel";
import fs from "fs";
import path from "path";
import readline from "readline";
import base58 from "bs58";
import chunk from "chunk";

import { BN } from "@project-serum/anchor";
import {
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";

import { loadDraculaGameProgram, loadWalletKey } from "./accounts";

import { MintTree } from "../utils/mint-tree";
import { GameItem } from "../../sdk";
import * as pda from "../../sdk/helpers/pda";
import { loadNFT, sleep } from "../utils/util";

export const createGame = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  adminKeypair: string,
  mintAccount: string,
  botAccount: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const adminKeypairLoaded = loadWalletKey(adminKeypair);
  const mintAccountKey = new PublicKey(mintAccount);
  const botAccountKey = new PublicKey(botAccount);

  const [rewardVaultPda, vaultAuthPda, gamePda] = await Promise.all([
    pda.getRewardVaultPda(),
    pda.getVaultAuthPda(),
    pda.getGamePda(),
  ]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  // initialize game pda
  await program.rpc.initialize(botAccountKey, {
    accounts: {
      admin: adminKeypairLoaded.publicKey,
      rewardMint: mintAccountKey,
      rewardVault: rewardVaultPda,
      vaultAuth: vaultAuthPda,
      game: gamePda,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [adminKeypairLoaded],
  });

  log.info("Reward Mint:", mintAccountKey.toBase58());
  log.info("Reward Vault:", rewardVaultPda.toBase58());
};

export const createGen = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  adminKeypair: string,
  genIndex: number,
  whitelistPath: string,
  treeOnly: boolean,
  createFlag: boolean
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const adminKeypairLoaded = loadWalletKey(adminKeypair);

  const [gamePda, genPda] = await Promise.all([
    pda.getGamePda(),
    pda.getGenPda(genIndex),
  ]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  const ext = path.extname(whitelistPath);
  const proofPath = path.resolve(
    path.dirname(whitelistPath),
    path.basename(whitelistPath, ext) + ".json"
  );

  const nftAdapter = new GameItem(program.provider.connection);
  let loadedMints = [];

  if (fs.existsSync(proofPath)) {
    // load NFT details from JSON
    loadedMints = JSON.parse(
      fs.readFileSync(proofPath, { encoding: "utf8" })
    ).map((it) => ({
      mint: it.mint,
      kind: it.kind,
      genIndex: it.genIndex,
    }));
  }

  // read mints from whitelist file
  const fileStream = fs.createReadStream(whitelistPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const inputs = [];
  const mints = [];
  for await (const input of rl) {
    const loaded = loadedMints.find((item) => item.mint === input);
    if (loaded) {
      mints.push(loaded);
    } else {
      inputs.push(input);
    }
  }
  log.info(`${mints.length} NFTs loaded from cache`);

  // Load 10 NFTs in chunk
  for await (const lines of chunk(inputs, 10)) {
    mints.push(
      ...(await Promise.all(lines.map((line) => loadNFT(nftAdapter, line))))
    );
  }

  // generate merkle root
  const tree = new MintTree(mints);
  log.info("Merkle Root:", tree.getRoot());

  // write proofs
  const proofs = [];
  mints.forEach((leaf, index) => {
    const proof = tree.getProof(index, leaf.mint, leaf.kind, leaf.genIndex);
    proofs.push({ index, ...leaf, proof });
  });
  fs.writeFileSync(proofPath, JSON.stringify(proofs));

  // generate SQL file with proofs
  let index = 0;
  for (const items of chunk(proofs, 1000)) {
    index++;
    const output = items.reduce((acc, it) => {
      acc += `(${it.index},"${it.mint}",${it.kind},${it.genIndex
        },"${JSON.stringify(it.proof)}"),`;
      return acc;
    }, "INSERT INTO tb_proof(`index`, `mint`, `kind`, `genIndex`, `proof`) VALUES ");
    fs.writeFileSync(
      path.resolve(
        path.dirname(whitelistPath),
        path.basename(whitelistPath, ext) + `_${index}.sql`
      ),
      output.slice(0, -1)
    );
  }

  const currGen = await program.account.gen.fetchNullable(genPda);
  log.info("Current Merkle Root:", currGen?.merkleRoot);

  if (!treeOnly) {
    if (createFlag) {
      // initialize generation
      await program.rpc.createGen(
        {
          merkleRoot: tree.getRoot(),
          genIndex,
        },
        {
          accounts: {
            admin: adminKeypairLoaded.publicKey,
            gen: genPda,
            game: gamePda,
            systemProgram: SystemProgram.programId,
          },
          signers: [adminKeypairLoaded],
        }
      );
    } else {
      // update generation
      await program.rpc.updateGen(
        {
          merkleRoot: tree.getRoot(),
          genIndex,
        },
        {
          accounts: {
            admin: adminKeypairLoaded.publicKey,
            gen: genPda,
            game: gamePda,
          },
          signers: [adminKeypairLoaded],
        }
      );
    }

    const gen = await program.account.gen.fetch(genPda);
    log.info("Deployed Merkle Root:", gen.merkleRoot);
  }
};

export const refreshVampires = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  botKeypair: string
) => {
  const CHUNK_SIZE = 4;

  // Keys
  const walletKeypairLoaded = loadWalletKey(keypair);
  const botKeypairLoaded = loadWalletKey(botKeypair);
  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  const gamePda = await pda.getGamePda();
  const game = await program.account.game.fetch(gamePda);
  // log.info("Vampire Rewards:", game.vampireRewardAmount.toString());
  log.info("Total claimable amount:", game.totalClaimableAmount.toString());

  const data = await program.provider.connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 8, length: 64 },
      filters: [
        { dataSize: Math.ceil(program.account.human.size / 8) * 8 },
        // is_active
        // { memcmp: { offset: 93, bytes: base58.encode([1]) } },
        // human
        {
          memcmp: {
            offset: 0,
            bytes: base58.encode([126, 188, 154, 36, 122, 204, 211, 107]),
          },
        },
        // vampire
        // {
        //   memcmp: {
        //     offset: 0,
        //     bytes: base58.encode([96, 78, 116, 187, 5, 32, 50, 71]),
        //   },
        // },
      ],
    }
  );
  const accounts = data.map((item) => ({
    reserve: item.pubkey,
    user: new PublicKey(base58.encode((item.account.data as Buffer).slice(0, 32))),
    mint: new PublicKey(base58.encode((item.account.data as Buffer).slice(32, 64))),
  }));

  const totalVampires = accounts.length;
  if (!totalVampires) {
    throw new Error("Not enough vampires");
  }
  if (game.vampireRewardAmount.lt(new BN(totalVampires))) {
    throw new Error("Not enough vampire reward pool liquidity");
  }

  const rewardPerVampire = game.vampireRewardAmount.divn(totalVampires);
  // log.info("Reward per Vampire:", rewardPerVampire.toString());
  log.info("Total staked NFTs:", totalVampires);

  const chunks = chunk(accounts, CHUNK_SIZE);

  let index = 0;
  for await (const chunk of chunks) {
    index++;

    const escrows = await Promise.all(
      chunk.map((item) => pda.getEscrowPda(item.mint))
    );

    const atas = await Promise.all(
      chunk.map((item) => pda.getMintAta(item.mint, item.user))
    );

    const instructions = await Promise.all(
      chunk.map((item, index) =>
        program.methods
          // .closeVampire()
          .closeHuman()
          .accounts({
            admin: walletKeypairLoaded.publicKey,
            nftMint: item.mint,
            user: item.user,
            userNftAta: atas[index],
            nftEscrow: escrows[index],
            // vampire: item.reserve,
            human: item.reserve,
            game: gamePda,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .instruction()
      )
    );

    await executeTxWithRetry(index, chunks.length, instructions, [
      walletKeypairLoaded,
    ]);
  }

  async function executeTxWithRetry(
    index: number,
    total: number,
    instructions: TransactionInstruction[],
    signers: Signer[],
    useLogger = false
  ) {
    try {
      log.info(`Processing: [${index}/${total}]`);

      await program.provider.send(
        new Transaction().add(...instructions),
        signers,
        { commitment: "processed" }
      );

      if (useLogger) {
        const chunks4Log = chunks.map((chunk) => ({
          chunk,
          completed: false,
          rewardPerVampire: rewardPerVampire.toNumber(),
        }));
        const dumpFilePath = path.join(
          process.cwd(),
          "dumps",
          `${env}_${new Date().getTime()}.json`
        );
        chunks4Log[index - 1].completed = true;
        fs.writeFileSync(dumpFilePath, JSON.stringify(chunks4Log));
      }

      log.info("Done!");
    } catch (err) {
      // log.info("Retrying in 10 seconds...");
      // await sleep(10);
      // await executeTxWithRetry(index, total, instructions, signers, useLogger);
      log.info("Skipping...");
    }
  }

  return;

  index = 0;
  for await (const chunk of chunks) {
    index++;

    const instructions: TransactionInstruction[] = chunk.map((item) =>
      program.instruction.refreshVampire(rewardPerVampire, {
        accounts: {
          bot: botKeypairLoaded.publicKey,
          vampire: item.reserve,
          game: gamePda,
        },
        signers: [botKeypairLoaded],
      })
    );

    // accumulate reward amount
    await executeTxWithRetry(
      index,
      chunks.length,
      instructions,
      [botKeypairLoaded],
      true
    );
  }

  // reduct distributed amount
  log.info("Refreshing vampire reward pool state");
  const distributedAmount = rewardPerVampire.muln(totalVampires);
  // const distributedAmount = new BN(9594).muln(1203);
  await program.rpc.refreshGame(distributedAmount, {
    accounts: {
      bot: botKeypairLoaded.publicKey,
      game: gamePda,
    },
    signers: [botKeypairLoaded],
  });
  log.info("Distributed amount:", distributedAmount.toString());

};

export const inspectHuman = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  mintAccount: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const mintAccountKey = new PublicKey(mintAccount);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  const humanPda = await pda.getHumanPda(mintAccountKey);
  const human = await program.account.human.fetch(humanPda);
  const playerPda = await pda.getPlayerPda(human.user);

  const currentBlockTime = await program.provider.connection.getBlockTime(
    await program.provider.connection.getSlot("finalized")
  );
  const rewardAmount =
    currentBlockTime > human.lastUpdateTime
      ? new BN(human.rewardPerDay)
        .muln(currentBlockTime - human.lastUpdateTime)
        .divn(86_400)
      : new BN(0);

  log.info("Owner:", human.user.toBase58());
  log.info("Player:", playerPda.toBase58());
  log.info("Min unstake amount:", human.minUnstakeAmount.toString());
  log.info("Reward amount:", rewardAmount.toString());
  log.info("Is Active:", human.isActive);
  log.info("Last harvest:", new Date(human.lastUpdateTime * 1000).toString());
};

export const inspectVampire = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  mintAccount: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const mintAccountKey = new PublicKey(mintAccount);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  const vampirePda = await pda.getVampirePda(mintAccountKey);
  const vampire = await program.account.vampire.fetch(vampirePda);
  // [205, 222, 112, 7, 165, 155, 206, 218]
  const playerPda = await pda.getPlayerPda(vampire.user);

  log.info("Owner:", vampire.user.toBase58());
  log.info("Player:", playerPda.toBase58());
  log.info("Min unstake amount:", vampire.minUnstakeAmount.toString());
  log.info("Reward amount:", vampire.rewardAmount.toString());
  log.info("Is Active:", vampire.isActive);
  log.info("Generation:", vampire.genIndex);
};
