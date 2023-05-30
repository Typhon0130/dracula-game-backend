import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as pda from "../packages/sdk/helpers/pda";
import { MintTree } from "../packages/cli/utils/mint-tree";
import { DraculaGame } from "../target/types/dracula_game";

describe("dracula-game v2", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DraculaGame as Program<DraculaGame>;

  const ADMIN_KEYPAIR = Keypair.generate();
  const BOT_KEYPAIR = Keypair.generate();
  const USER_KEYPAIR = Keypair.generate();
  const MINT_AUTH_KEYPAIR = Keypair.generate();

  /// Merkle
  let tree: MintTree;

  /// PDA
  let rewardVaultPda: PublicKey,
    vaultAuthPda: PublicKey,
    gamePda: PublicKey,
    genPda: PublicKey,
    lotteryPoolPda: PublicKey,
    lotteryVaultPda: PublicKey;

  // Token mint
  let rewardMint: Token, humanMint: Token, vampireMint: Token;

  // ATA
  let humanNftAta: PublicKey, vampireNftAta: PublicKey;

  before(async () => {
    // airdrop SOLs to admin
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        ADMIN_KEYPAIR.publicKey,
        LAMPORTS_PER_SOL
      ),
      "confirmed"
    );
    // airdrop SOLs to user
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        USER_KEYPAIR.publicKey,
        LAMPORTS_PER_SOL
      ),
      "confirmed"
    );

    /** Initialzie mint clients */
    [rewardMint, humanMint, vampireMint] = await Promise.all([
      Token.createMint(
        provider.connection,
        ADMIN_KEYPAIR,
        MINT_AUTH_KEYPAIR.publicKey,
        null,
        0,
        TOKEN_PROGRAM_ID
      ),
      Token.createMint(
        provider.connection,
        ADMIN_KEYPAIR,
        MINT_AUTH_KEYPAIR.publicKey,
        null,
        0,
        TOKEN_PROGRAM_ID
      ),
      Token.createMint(
        provider.connection,
        ADMIN_KEYPAIR,
        MINT_AUTH_KEYPAIR.publicKey,
        null,
        0,
        TOKEN_PROGRAM_ID
      ),
    ]);

    /** Initilalize PDAs */
    [
      rewardVaultPda,
      vaultAuthPda,
      gamePda,
      genPda,
      lotteryPoolPda,
      lotteryVaultPda,
    ] = await Promise.all([
      pda.getRewardVaultPda(),
      pda.getVaultAuthPda(),
      pda.getGamePda(),
      pda.getGenPda(0),
      pda.getLotteryPoolPda(),
      pda.getLotteryVaultPda(),
    ]);

    /** Initialize ATAs */
    [humanNftAta, vampireNftAta] = await Promise.all([
      humanMint.createAssociatedTokenAccount(USER_KEYPAIR.publicKey),
      vampireMint.createAssociatedTokenAccount(USER_KEYPAIR.publicKey),
      // rewardMint.createAssociatedTokenAccount(USER_KEYPAIR.publicKey),
    ]);

    /** airdrop Human & Vampire */
    await Promise.all([
      humanMint.mintTo(
        humanNftAta,
        MINT_AUTH_KEYPAIR.publicKey,
        [MINT_AUTH_KEYPAIR],
        1
      ),
      vampireMint.mintTo(
        vampireNftAta,
        MINT_AUTH_KEYPAIR.publicKey,
        [MINT_AUTH_KEYPAIR],
        1
      ),
    ]);
  });

  it("should initialize game", async () => {
    // initialize game pda
    await provider.connection.confirmTransaction(
      await program.provider.connection.sendTransaction(
        await program.methods
          .initialize(BOT_KEYPAIR.publicKey)
          .accounts({
            admin: ADMIN_KEYPAIR.publicKey,
            rewardMint: rewardMint.publicKey,
            rewardVault: rewardVaultPda,
            vaultAuth: vaultAuthPda,
            game: gamePda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .transaction(),
        [ADMIN_KEYPAIR]
      )
    );

    // airdrop 9M $BLOOD to reward vault account
    await rewardMint.mintTo(
      rewardVaultPda,
      MINT_AUTH_KEYPAIR.publicKey,
      [MINT_AUTH_KEYPAIR],
      9_000_000
    );
  });

  it("should initialize Gen 0", async () => {
    const genIndex = 0;

    tree = new MintTree([
      // Vampire Gen 0
      { mint: vampireMint.publicKey.toBase58(), kind: 0, genIndex },
      // Human O Gen 0
      { mint: humanMint.publicKey.toBase58(), kind: 1, genIndex },
    ]);

    // initialize generation
    await provider.connection.confirmTransaction(
      await provider.connection.sendTransaction(
        await program.methods
          .createGen({
            merkleRoot: tree.getRoot(),
            genIndex,
          })
          .accounts({
            admin: ADMIN_KEYPAIR.publicKey,
            gen: genPda,
            game: gamePda,
            systemProgram: SystemProgram.programId,
          })
          .transaction(),
        [ADMIN_KEYPAIR]
      )
    );
  });

  it("should create lottery pool", async () => {
    // create lottery pool
    await provider.connection.confirmTransaction(
      await provider.connection.sendTransaction(
        await program.methods
          .createLotteryPool(BOT_KEYPAIR.publicKey)
          .accounts({
            admin: ADMIN_KEYPAIR.publicKey,
            rewardMint: rewardMint.publicKey,
            vaultAuth: vaultAuthPda,
            lotteryVault: lotteryVaultPda,
            lotteryPool: lotteryPoolPda,
            game: gamePda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .transaction(),
        [ADMIN_KEYPAIR]
      )
    );
  });
});
