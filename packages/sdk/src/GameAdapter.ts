import { Program, Provider, Idl } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey } from "@solana/web3.js";
import GameConfig from "./GameConfig";
import * as constant from "../helpers/constant";
import * as pda from "../helpers/pda";
import { DraculaGame } from "../helpers/types";
import idl from "../helpers/idl.json";

export default class GameAdapter {
  public program: Program<DraculaGame>;
  public provider: Provider;
  public config: GameConfig;

  // reward mint client & ATA
  public mintClient: Token;
  public beneficiaryAta: PublicKey;

  // PDA
  public rewardVaultPda: PublicKey;
  public vaultAuthPda: PublicKey;
  public gamePda: PublicKey;
  public playerPda: PublicKey;
  public lotteryPoolPda: PublicKey;
  public lotteryVaultPda: PublicKey;

  /**
   * constructor
   *
   * @param provider Wallet provider
   * @param config Game configuration
   */
  constructor(provider: Provider, config: GameConfig) {
    this.program = new Program(
      idl as Idl,
      constant.PROGRAM_ID,
      provider
    ) as Program<DraculaGame>;
    this.provider = provider;
    this.config = config;

    this.mintClient = new Token(
      this.provider.connection,
      this.config.mint,
      TOKEN_PROGRAM_ID,
      Keypair.generate()
    );
  }

  /**
   * build PDA and ATA
   */
  public async build() {
    // game state PDAs
    [
      this.rewardVaultPda,
      this.vaultAuthPda,
      this.gamePda,
      this.lotteryPoolPda,
      this.lotteryVaultPda,
    ] = await Promise.all([
      pda.getRewardVaultPda(),
      pda.getVaultAuthPda(),
      pda.getGamePda(),
      pda.getLotteryPoolPda(),
      pda.getLotteryVaultPda(),
    ]);

    // if user wallet connected
    if (this.provider.wallet?.publicKey) {
      [this.playerPda, this.beneficiaryAta] = await Promise.all([
        pda.getPlayerPda(this.provider.wallet.publicKey),
        Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this.config.mint,
          this.provider.wallet.publicKey
        ),
      ]);
    }
  }

  /**
   * get lottery pool state
   */
  public async getLotteryPool(): Promise<{
    startTime: Date;
    endTime: Date;
    liquidity: number;
  }> {
    const [pool, vault] = await Promise.all([
      this.program.account.lotteryPool.fetch(this.lotteryPoolPda),
      this.provider.connection.getTokenAccountBalance(this.lotteryVaultPda),
    ]);

    return {
      startTime: new Date(pool.startTime * 1000),
      endTime: new Date(pool.endTime * 1000),
      liquidity: vault.value.uiAmount,
    };
  }
}
