import fs from "fs";
import path from "path";
import log from "loglevel";
import chunk from "chunk";
import base58 from "bs58";

import { BN, Provider } from "@project-serum/anchor";
import {
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { loadDraculaGameProgram, loadWalletKey } from "./accounts";

import * as pda from "../../sdk/helpers/pda";
import { sleep } from "../utils/util";

export const createLotteryPool = async (
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

  const [vaultAuthPda, lotteryPoolPda, lotteryVaultPda, gamePda] =
    await Promise.all([
      pda.getVaultAuthPda(),
      pda.getLotteryPoolPda(),
      pda.getLotteryVaultPda(),
      pda.getGamePda(),
    ]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  // initialize lottery pool pda
  await program.provider.connection.confirmTransaction(
    await program.provider.connection.sendTransaction(
      await program.methods
        .createLotteryPool(botAccountKey)
        .accounts({
          admin: adminKeypairLoaded.publicKey,
          rewardMint: mintAccountKey,
          vaultAuth: vaultAuthPda,
          lotteryVault: lotteryVaultPda,
          lotteryPool: lotteryPoolPda,
          game: gamePda,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction(),
      [walletKeypairLoaded, adminKeypairLoaded]
    )
  );

  log.info("Lottery Vault:", lotteryVaultPda.toBase58());
  log.info("Lottery Pool:", lotteryPoolPda.toBase58());
};

export const refreshLotteryPool = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  botKeypair: string,
  startTime: string,
  endTime: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const botKeypairLoaded = loadWalletKey(botKeypair);

  const [lotteryPoolPda] = await Promise.all([pda.getLotteryPoolPda()]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  // refresh lottery pool
  await program.provider.connection.confirmTransaction(
    await program.provider.connection.sendTransaction(
      await program.methods
        .refreshLotteryPool({
          startTime: new Date(startTime).getTime() / 1000,
          endTime: new Date(endTime).getTime() / 1000,
        })
        .accounts({
          bot: botKeypairLoaded.publicKey,
          lotteryPool: lotteryPoolPda,
        })
        .transaction(),
      [walletKeypairLoaded, botKeypairLoaded]
    )
  );
};

export const resetLotteryVault = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  botKeypair: string,
  mintAccount: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const botKeypairLoaded = loadWalletKey(botKeypair);
  const mintAccountKey = new PublicKey(mintAccount);

  const [lotteryPoolPda, lotteryVaultPda, vaultAuthPda] = await Promise.all([
    pda.getLotteryPoolPda(),
    pda.getLotteryVaultPda(),
    pda.getVaultAuthPda(),
  ]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  // send transaction
  await program.provider.connection.confirmTransaction(
    await program.provider.connection.sendTransaction(
      await program.methods
        .resetLotteryVault()
        .accounts({
          bot: botKeypairLoaded.publicKey,
          mint: mintAccountKey,
          lotteryVault: lotteryVaultPda,
          vaultAuth: vaultAuthPda,
          lotteryPool: lotteryPoolPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .transaction(),
      [walletKeypairLoaded, botKeypairLoaded]
    )
  );
};

export const distributeLotteryReward = async (
  keypair: string,
  env: string,
  customRpcUrl: string | null,
  botKeypair: string,
  mintAccount: string
) => {
  const walletKeypairLoaded = loadWalletKey(keypair);
  const botKeypairLoaded = loadWalletKey(botKeypair);
  const mintAccountKey = new PublicKey(mintAccount);

  const [lotteryPoolPda, lotteryVaultPda, vaultAuthPda] = await Promise.all([
    pda.getLotteryPoolPda(),
    pda.getLotteryVaultPda(),
    pda.getVaultAuthPda(),
  ]);

  // load game program
  const program = loadDraculaGameProgram(
    walletKeypairLoaded,
    env,
    customRpcUrl
  );

  const data = await program.provider.connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 8, length: 64 },
      filters: [
        // is_active
        { memcmp: { offset: 74, bytes: base58.encode([1]) } },
        {
          memcmp: {
            offset: 0,
            bytes: base58.encode([162, 182, 26, 12, 164, 214, 112, 3]),
          },
        },
      ],
    }
  );

  log.info("\nDistributing rewards to winners...");

  const users = shuffle(
    data.map((item) =>
      base58.encode((item.account.data as Buffer).slice(0, 32))
    )
  );
  const winners_count = Math.ceil(users.length / 100);
  const winners = users.slice(0, winners_count);

  const lotteryVault = await program.provider.connection.getTokenAccountBalance(
    lotteryVaultPda
  );
  const rewardPerWinner = Math.floor(
    lotteryVault.value.uiAmount / 2 / winners_count
  );

  log.info("Lottery pool liq:", lotteryVault.value.uiAmount);
  log.info("Reward per winner:", rewardPerWinner);
  log.info("Total users:", users.length);
  log.info("Total winners:", winners_count);

  const beneficiary_token_accounts = await Promise.all(
    winners
      .map((user: string) => new PublicKey(user))
      .map((owner: PublicKey) => pda.getMintAta(mintAccountKey, owner))
  );

  fs.writeFileSync(path.resolve(process.cwd(), "dumps", `winners_${new Date().getTime()}.txt`), winners.join("\n"));

  const beneficiary_chunks = chunk(beneficiary_token_accounts, 16);
  let index = 0;
  for await (const items of beneficiary_chunks) {
    index++;

    const instructions = await Promise.all(
      items.map((beneficiary) =>
        program.methods
          .distributeLotteryReward(new BN(rewardPerWinner))
          .accounts({
            bot: botKeypairLoaded.publicKey,
            beneficiary,
            lotteryVault: lotteryVaultPda,
            vaultAuth: vaultAuthPda,
            lotteryPool: lotteryPoolPda,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction()
      )
    );

    await executeTxWithRetry(
      index,
      beneficiary_chunks.length,
      instructions,
      [walletKeypairLoaded, botKeypairLoaded],
      program.provider
    );
  }

  log.info("\nUnstaking NFTs...");

  const accounts = data.map((item) => ({
    lottery: item.pubkey,
    user: new PublicKey(
      base58.encode((item.account.data as Buffer).slice(0, 32))
    ),
    mint: new PublicKey(
      base58.encode((item.account.data as Buffer).slice(32, 64))
    ),
  }));

  const unstake_chunks = chunk(accounts, 4);
  index = 0;
  for await (const items of unstake_chunks) {
    index++;
    const userNftAtas = await Promise.all(
      items.map((item) => pda.getMintAta(item.mint, item.user))
    );
    const lotteryEscrows = await Promise.all(
      items.map((item) => pda.getLotteryEscrowPda(item.mint))
    );
    const instructions = await Promise.all(
      items.map((item, index) =>
        program.methods
          .unstakeLottery()
          .accounts({
            bot: botKeypairLoaded.publicKey,
            user: item.user,
            nftMint: item.mint,
            userNftAta: userNftAtas[index],
            lotteryEscrow: lotteryEscrows[index],
            lottery: item.lottery,
            lotteryPool: lotteryPoolPda,
            rentPayer: walletKeypairLoaded.publicKey,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          })
          .instruction()
      )
    );
    await executeTxWithRetry(
      index,
      unstake_chunks.length,
      instructions,
      [walletKeypairLoaded, botKeypairLoaded],
      program.provider
    );
  }
};

async function executeTxWithRetry(
  index: number,
  total: number,
  instructions: TransactionInstruction[],
  signers: Signer[],
  provider: Provider
) {
  try {
    log.info(`Processing: [${index}/${total}]`);

    await provider.send(new Transaction().add(...instructions), signers, {
      commitment: "processed",
    });

    log.info("Done!");
  } catch (err) {
    log.info("Retrying in 10 seconds...");
    await sleep(10);
    await executeTxWithRetry(index, total, instructions, signers, provider);
  }
}

export function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
