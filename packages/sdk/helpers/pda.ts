import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import * as constant from "./constant";

export async function getRewardVaultPda(): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.REWARD_REWARD_VAULT_SEED)],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getVaultAuthPda(): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.VAULT_VAULT_AUTH_SEED)],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getGamePda(): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.GAME_SEED)],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getGenPda(index: number): Promise<PublicKey> {
  if (index < 0 || index > 255) {
    throw Error("Invalid index");
  }

  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.GEN_SEED), new Uint8Array([index])],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getPlayerPda(userWallet: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.PLAYER_SEED), userWallet.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getEscrowPda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.ESCROW_SEED), mint.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getHumanPda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.HUMAN_SEED), mint.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getVampirePda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.VAMPIRE_SEED), mint.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getGamblePda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.GAMBLE_SEED), Buffer.from("NFT"), mint.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getLotteryPoolPda(): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.LOTTERY_POOL_SEED)],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getLotteryVaultPda(): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.LOTTERY_VAULT_SEED)],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getLotteryEscrowPda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from(constant.ESCROW_SEED),
        Buffer.from(constant.LOTTERY_SEED),
        mint.toBuffer(),
      ],
      constant.PROGRAM_ID
    )
  )[0];
}

export async function getLotteryPda(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from(constant.LOTTERY_SEED), mint.toBuffer()],
      constant.PROGRAM_ID
    )
  )[0];
}

export const getMintAta = async (
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};
