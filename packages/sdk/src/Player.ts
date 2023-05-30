import base58 from "bs58";
import fetch from "node-fetch";
import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { BN } from "@project-serum/anchor";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import GameAdapter from "./GameAdapter";
import GameItem, {
  GameItemData,
  StakedHumanData,
  StakedVampireData,
} from "./GameItem";

import * as pda from "../helpers/pda";

export type PlayerState = {
  claimableAmount: BN;
  totalHumans: number;
  totalVampires: number;
};

export default class Player {
  protected adapter: GameAdapter;
  protected item: GameItem;

  /**
   * constructor
   *
   * @param adapter Game adapter
   */
  constructor(adapter: GameAdapter) {
    if (!adapter.provider.wallet?.publicKey) {
      throw new Error("Wallet not connected");
    }

    this.adapter = adapter;
    this.item = new GameItem(this.adapter.provider.connection);
  }

  /**
   * get staked humans and vampires
   *
   * @returns {PlayerState}
   */
  public async getState(): Promise<PlayerState> {
    const state = await this.adapter.program.account.player.fetchNullable(
      this.adapter.playerPda
    );

    if (!state) {
      return {
        claimableAmount: new BN(0),
        totalHumans: 0,
        totalVampires: 0,
      };
    }

    return state as PlayerState;
  }

  /**
   * get available game NFTs
   */
  public async getGameItems(): Promise<{
    vampires: GameItemData[];
    humans: GameItemData[];
  }> {
    const nfts = await getParsedNftAccountsByOwner({
      publicAddress: this.adapter.provider.wallet.publicKey.toBase58(),
      connection: this.adapter.provider.connection,
    });

    const gameItems = await Promise.all(
      nfts
        .filter((nft) => nft.data.name.startsWith("The Dracula Game"))
        .map((nft) => this.item.fetchJsondata(nft.mint, nft.data.uri))
    );

    return {
      vampires: gameItems.filter((item) => item.kind === 0),
      humans: gameItems.filter((item) => item.kind > 0),
    };
  }

  /**
   * @deprecated
   * get staked game NFTs
   */
  public async getStakedGameItems(): Promise<{
    vampires: GameItemData[];
    humans: GameItemData[];
  }> {
    const accounts =
      await this.adapter.program.provider.connection.getProgramAccounts(
        this.adapter.program.programId,
        {
          dataSlice: { offset: 40, length: 32 },
          filters: [
            {
              dataSize:
                Math.ceil(this.adapter.program.account.vampire.size / 8) * 8,
            },
            {
              memcmp: {
                offset: 8,
                bytes: this.adapter.provider.wallet.publicKey.toBase58(),
              },
            },
            { memcmp: { offset: 93, bytes: base58.encode([1]) } },
          ],
        }
      );

    const nfts = await Promise.all(
      accounts
        .map((item) => base58.encode(item.account.data as Buffer))
        .map((mint) => this.item.fetchMetadata(new PublicKey(mint)))
    );

    const gameItems = await Promise.all(
      nfts.map((nft) => this.item.fetchJsondata(nft.mint, nft.data.uri))
    );

    return {
      vampires: gameItems.filter((item) => item.kind === 0),
      humans: gameItems.filter((item) => item.kind > 0),
    };
  }

  /**
   * get staked game NFTs V2
   */
  public async getStakedGameItemsV2(): Promise<{
    vampires: StakedHumanData[];
    humans: StakedVampireData[];
  }> {
    const accounts =
      await this.adapter.program.provider.connection.getProgramAccounts(
        this.adapter.program.programId,
        {
          dataSlice: { offset: 40, length: 32 },
          filters: [
            {
              dataSize:
                Math.ceil(this.adapter.program.account.vampire.size / 8) * 8,
            },
            {
              memcmp: {
                offset: 8,
                bytes: this.adapter.provider.wallet.publicKey.toBase58(),
              },
            },
            { memcmp: { offset: 93, bytes: base58.encode([1]) } },
          ],
        }
      );

    const nfts = await Promise.all(
      accounts
        .map((item) => base58.encode(item.account.data as Buffer))
        .map((mint) => this.item.fetchMetadata(new PublicKey(mint)))
    );

    const gameItems = await Promise.all(
      nfts.map((nft) => this.item.fetchJsondata(nft.mint, nft.data.uri))
    );

    const gameData = [];
    for await (const item of gameItems) {
      const resevePda = await (item.kind === 0
        ? pda.getVampirePda(new PublicKey(item.mint))
        : pda.getHumanPda(new PublicKey(item.mint)));
      const state = await this.adapter.program.account[
        ["vampire", "human"][item.kind === 0 ? 0 : 1]
      ].fetchNullable(resevePda);

      if (state) {
        gameData.push({ ...item, state });
      }
    }

    // hard patch due to faucet is off
    // faucet is officially closed at 2022-03-21T11:35:25.000Z
    const currentBlockTime = 1647862525;
    // const currentBlockTime =
    //   await this.adapter.provider.connection.getBlockTime(
    //     await this.adapter.provider.connection.getSlot("finalized")
    //   );

    return {
      vampires: gameData
        .filter((item) => item.kind === 0)
        .map((item) => {
          const state = item.state as any as {
            rewardAmount: BN;
            minUnstakeAmount: BN;
            taxFee: { basisPoints: number };
            lossChance: number;
          };

          return {
            ...item,
            state: {
              rewardAmount: state.rewardAmount,
              minUnstakeAmount: state.minUnstakeAmount,
              taxFee: state.taxFee.basisPoints / 100,
              lossChance: state.lossChance,
            },
          };
        }),
      humans: gameData
        .filter((item) => item.kind)
        .map((item) => {
          const state = item.state as any as {
            rewardPerDay: number;
            minUnstakeAmount: BN;
            taxFee: { basisPoints: number };
            lossChance: number;
            lastUpdateTime: number;
          };

          return {
            ...item,
            state: {
              rewardPerTick: state.rewardPerDay / 86_400,
              tickDuration: 1_000,
              rewardAmount:
                currentBlockTime > state.lastUpdateTime
                  ? new BN(state.rewardPerDay)
                      .muln(currentBlockTime - state.lastUpdateTime)
                      .divn(86_400)
                  : new BN(0),
              minUnstakeAmount: state.minUnstakeAmount,
              taxFee: state.taxFee.basisPoints / 100,
              lossChance: state.lossChance,
            },
          };
        }),
    };
  }

  /**
   * stake human NFT
   *
   * @param mint
   */
  public async stakeHuman(mint: PublicKey): Promise<Transaction> {
    // get mint proof details from api
    const leaf = await (
      await fetch(
        `${this.adapter.config.apiEndpoint}/merkle-proof/${mint.toBase58()}`
      )
    ).json();
    if (!leaf) throw new Error("NFT not verified");

    const tx = new Transaction();

    // PDAs
    const [escrowPda, humanPda, nftAta, genPda] = await Promise.all([
      pda.getEscrowPda(mint),
      pda.getHumanPda(mint),
      pda.getMintAta(mint, this.adapter.provider.wallet.publicKey),
      pda.getGenPda(leaf.genIndex),
    ]);

    // states
    const [player, human] = await Promise.all([
      this.adapter.program.account.player.fetchNullable(this.adapter.playerPda),
      this.adapter.program.account.human.fetchNullable(humanPda),
    ]);

    // create player state
    if (!player) {
      tx.add(
        await this.adapter.program.methods
          .createPlayer()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            player: this.adapter.playerPda,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
    }

    // create human escrow & state
    if (!human) {
      tx.add(
        await this.adapter.program.methods
          .createHuman()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            nftMint: mint,
            nftEscrow: escrowPda,
            human: humanPda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .instruction()
      );
    }

    // stake human NFT
    tx.add(
      await this.adapter.program.methods
        .stakeHuman({
          index: new BN(leaf.index),
          proof: JSON.parse(leaf.proof),
          nftKind: leaf.kind,
        })
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardVault: this.adapter.rewardVaultPda,
          nftAta,
          nftEscrow: escrowPda,
          human: humanPda,
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          gen: genPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * unstake human
   * @param mint
   */
  public async unstakeHuman(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    const [escrowPda, humanPda, nftAta] = await Promise.all([
      pda.getEscrowPda(mint),
      pda.getHumanPda(mint),
      pda.getMintAta(mint, this.adapter.provider.wallet.publicKey),
    ]);

    try {
      const mintClient = new Token(
        this.adapter.provider.connection,
        mint,
        TOKEN_PROGRAM_ID,
        Keypair.generate()
      );
      await mintClient.getAccountInfo(nftAta);
    } catch (err) {
      tx.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          nftAta,
          this.adapter.provider.wallet.publicKey,
          this.adapter.provider.wallet.publicKey
        )
      );
    }

    tx.add(
      await this.adapter.program.methods
        .unstakeHuman()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          nftAta,
          nftEscrow: escrowPda,
          human: humanPda,
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * gamble human NFT
   *
   * @param mint
   */
  public async gambleHuman(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    // PDAs
    const [humanPda, gamblePda] = await Promise.all([
      pda.getHumanPda(mint),
      pda.getGamblePda(mint),
    ]);

    // states
    const [gamble] = await Promise.all([
      this.adapter.program.account.gamble.fetchNullable(gamblePda),
    ]);
    // create gamble state
    if (!gamble) {
      tx.add(
        await this.adapter.program.methods
          .createGamble()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            nftMint: mint,
            gamble: gamblePda,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
    }

    // gamble with human NFT
    tx.add(
      await this.adapter.program.methods
        .gambleHuman()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardMint: this.adapter.config.mint,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          nftMint: mint,
          human: humanPda,
          gamble: gamblePda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * harvest human
   * @param mint
   */
  public async harvestHuman(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    tx.add(
      await this.adapter.program.methods
        .harvestHuman()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardMint: this.adapter.config.mint,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          nftMint: mint,
          human: await pda.getHumanPda(mint),
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * stake vampire NFT
   *
   * @param mint
   */
  public async stakeVampire(mint: PublicKey): Promise<Transaction> {
    // get mint proof details from api
    const leaf = await (
      await fetch(
        `${this.adapter.config.apiEndpoint}/merkle-proof/${mint.toBase58()}`
      )
    ).json();
    if (!leaf) throw new Error("NFT not verified");

    const tx = new Transaction();

    // PDAs
    const [escrowPda, vampirePda, nftAta, genPda] = await Promise.all([
      pda.getEscrowPda(mint),
      pda.getVampirePda(mint),
      pda.getMintAta(mint, this.adapter.provider.wallet.publicKey),
      pda.getGenPda(leaf.genIndex),
    ]);

    // states
    const [player, vampire] = await Promise.all([
      this.adapter.program.account.player.fetchNullable(this.adapter.playerPda),
      this.adapter.program.account.vampire.fetchNullable(vampirePda),
    ]);

    // create player state
    if (!player) {
      tx.add(
        await this.adapter.program.methods
          .createPlayer()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            player: this.adapter.playerPda,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
    }

    // create vampire escrow & state
    if (!vampire) {
      tx.add(
        await this.adapter.program.methods
          .createVampire()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            nftMint: mint,
            nftEscrow: escrowPda,
            vampire: vampirePda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .instruction()
      );
    }

    // stake vampire NFT
    tx.add(
      await this.adapter.program.methods
        .stakeVampire({
          index: new BN(leaf.index),
          proof: JSON.parse(leaf.proof),
          nftKind: leaf.kind,
        })
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardVault: this.adapter.rewardVaultPda,
          nftAta,
          nftEscrow: escrowPda,
          vampire: vampirePda,
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          gen: genPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * unstake vampire
   * @param mint
   */
  public async unstakeVampire(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    const [escrowPda, vampirePda, nftAta] = await Promise.all([
      pda.getEscrowPda(mint),
      pda.getVampirePda(mint),
      pda.getMintAta(mint, this.adapter.provider.wallet.publicKey),
    ]);

    try {
      const mintClient = new Token(
        this.adapter.provider.connection,
        mint,
        TOKEN_PROGRAM_ID,
        Keypair.generate()
      );
      await mintClient.getAccountInfo(nftAta);
    } catch (err) {
      tx.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          nftAta,
          this.adapter.provider.wallet.publicKey,
          this.adapter.provider.wallet.publicKey
        )
      );
    }

    tx.add(
      await this.adapter.program.methods
        .unstakeVampire()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardMint: this.adapter.config.mint,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          nftAta,
          nftEscrow: escrowPda,
          vampire: vampirePda,
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * gamble vampire NFT
   *
   * @param mint
   */
  public async gambleVampire(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    // PDAs
    const [vampirePda, gamblePda] = await Promise.all([
      pda.getVampirePda(mint),
      pda.getGamblePda(mint),
    ]);

    // states
    const [gamble] = await Promise.all([
      this.adapter.program.account.gamble.fetchNullable(gamblePda),
    ]);
    // create gamble state
    if (!gamble) {
      tx.add(
        await this.adapter.program.methods
          .createGamble()
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            nftMint: mint,
            gamble: gamblePda,
            systemProgram: SystemProgram.programId,
          })
          .instruction()
      );
    }

    // gamble with vampire NFT
    tx.add(
      await this.adapter.program.methods
        .gambleVampire()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardMint: this.adapter.config.mint,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          nftMint: mint,
          vampire: vampirePda,
          gamble: gamblePda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * harvest vampire
   * @param mint
   */
  public async harvestVampire(mint: PublicKey): Promise<Transaction> {
    const tx = new Transaction();

    tx.add(
      await this.adapter.program.methods
        .harvestVampire()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          rewardMint: this.adapter.config.mint,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          nftMint: mint,
          vampire: await pda.getVampirePda(mint),
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * claim for rewards
   */
  public async claimRewards(): Promise<Transaction> {
    const tx = new Transaction();

    try {
      await this.adapter.mintClient.getAccountInfo(this.adapter.beneficiaryAta);
    } catch (err) {
      tx.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          this.adapter.config.mint,
          this.adapter.beneficiaryAta,
          this.adapter.provider.wallet.publicKey,
          this.adapter.provider.wallet.publicKey
        )
      );
    }

    tx.add(
      await this.adapter.program.methods
        .claim()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          beneficiaryAta: this.adapter.beneficiaryAta,
          rewardVault: this.adapter.rewardVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          player: this.adapter.playerPda,
          game: this.adapter.gamePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }

  /**
   * get staked lottery game NFTs
   */
  public async getStakedLotteryGameItems(): Promise<{
    vampires: GameItemData[];
    humans: GameItemData[];
  }> {
    const accounts =
      await this.adapter.program.provider.connection.getProgramAccounts(
        this.adapter.program.programId,
        {
          dataSlice: { offset: 40, length: 32 },
          filters: [
            {
              memcmp: {
                offset: 8,
                bytes: this.adapter.provider.wallet.publicKey.toBase58(),
              },
            },
            {
              memcmp: {
                offset: 0,
                bytes: base58.encode([162, 182, 26, 12, 164, 214, 112, 3]),
              },
            },
            { memcmp: { offset: 74, bytes: base58.encode([1]) } },
          ],
        }
      );

    const nfts = await Promise.all(
      accounts
        .map((item) => base58.encode(item.account.data as Buffer))
        .map((mint) => this.item.fetchMetadata(new PublicKey(mint)))
    );

    const gameItems = await Promise.all(
      nfts.map((nft) => this.item.fetchJsondata(nft.mint, nft.data.uri))
    );

    return {
      vampires: gameItems.filter((item) => item.kind === 0),
      humans: gameItems.filter((item) => item.kind > 0),
    };
  }

  /**
   * stake to lottery pool
   *
   * @param mint NFT mint
   */
  public async stake2Lottery(mint: PublicKey): Promise<Transaction> {
    // get mint proof details from api
    const leaf = await (
      await fetch(
        `${this.adapter.config.apiEndpoint}/merkle-proof/${mint.toBase58()}`
      )
    ).json();
    if (!leaf) throw new Error("NFT not verified");

    const tx = new Transaction();

    const [escrowPda, lotteryPda, genPda, userNftAta, userRewardAta] =
      await Promise.all([
        pda.getLotteryEscrowPda(mint),
        pda.getLotteryPda(mint),
        pda.getGenPda(leaf.genIndex),
        pda.getMintAta(mint, this.adapter.provider.wallet.publicKey),
        pda.getMintAta(
          this.adapter.config.mint,
          this.adapter.provider.wallet.publicKey
        ),
      ]);
    const lottery = await this.adapter.program.account.lottery.fetchNullable(
      lotteryPda
    );
    if (!lottery) {
      tx.add(
        await this.adapter.program.methods
          .createLottery({
            index: new BN(leaf.index),
            proof: JSON.parse(leaf.proof),
            nftKind: leaf.kind,
          })
          .accounts({
            user: this.adapter.provider.wallet.publicKey,
            nftMint: mint,
            lotteryEscrow: escrowPda,
            lottery: lotteryPda,
            gen: genPda,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          })
          .instruction()
      );
    }

    tx.add(
      await this.adapter.program.methods
        .stakeLottery()
        .accounts({
          user: this.adapter.provider.wallet.publicKey,
          userNftAta,
          userRewardAta,
          lotteryEscrow: escrowPda,
          lotteryVault: this.adapter.lotteryVaultPda,
          vaultAuth: this.adapter.vaultAuthPda,
          lottery: lotteryPda,
          lotteryPool: this.adapter.lotteryPoolPda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .instruction()
    );

    return tx;
  }
}
