use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{args::*, constant::LOTTERY_ENTER_FEE, error::*, merkle_proof, states::*, traits::*};

/// lottery
#[derive(Accounts)]
#[repr(C)]
pub struct CreateLottery<'info> {
    /// initializer
    #[account(mut)]
    pub user: Signer<'info>,

    /// NFT mint
    pub nft_mint: Box<Account<'info, Mint>>,

    /// Lottery escrow account
    #[account(
        init,
        seeds = [Escrow::SEED, Lottery::SEED, nft_mint.key().as_ref()],
        bump,
        payer = user,
        token::mint = nft_mint,
        token::authority = lottery,
    )]
    pub lottery_escrow: Box<Account<'info, TokenAccount>>,

    /// lottery state
    /// no need to check extra security here
    /// it's just to create lottery state account for an NFT
    #[account(
        init,
        seeds = [Lottery::SEED, nft_mint.key().as_ref()],
        bump,
        payer = user,
        space = Lottery::SPACE,
    )]
    pub lottery: Box<Account<'info, Lottery>>,

    /// generation state
    #[account(
        seeds = [Gen::SEED, &[gen.index]],
        bump,
    )]
    pub gen: Box<Account<'info, Gen>>,

    /// system program
    pub system_program: Program<'info, System>,

    /// token program
    pub token_program: Program<'info, Token>,

    /// rent var
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateLottery<'info> {
    pub fn process(&mut self, args: StakeArgs) -> Result<()> {
        // verify the merkle proof.
        let node = anchor_lang::solana_program::keccak::hashv(&[
            &args.index.to_le_bytes(),
            &self.nft_mint.key().to_bytes(),
            &[args.nft_kind],
            &[self.gen.index],
        ]);
        require!(
            merkle_proof::verify(args.proof, self.gen.merkle_root, node.0),
            GameError::InvalidHuman
        );

        self.lottery.user = self.user.key();
        self.lottery.mint = self.nft_mint.key();
        self.lottery.kind = args.nft_kind;
        self.lottery.gen_index = self.gen.index;
        self.lottery.is_active = false;

        Ok(())
    }
}

/// stake lottery
#[derive(Accounts)]
#[repr(C)]
pub struct StakeLottery<'info> {
    /// initializer
    #[account(mut)]
    pub user: Signer<'info>,

    /// user's NFT token ATA
    #[account(
        mut,
        constraint = user_nft_ata.owner == user.key() @ GameError::InvalidNFTOwner,
        constraint = user_nft_ata.amount == 1 @ GameError::InsufficientNFTBalance,
    )]
    pub user_nft_ata: Box<Account<'info, TokenAccount>>,

    /// user's reward token ATA
    #[account(
        mut,
        constraint = user_reward_ata.owner == user.key() @ GameError::InvalidTokenOwner,
        constraint = user_reward_ata.amount >= LOTTERY_ENTER_FEE @ GameError::InsufficientTokenBalance,
    )]
    pub user_reward_ata: Box<Account<'info, TokenAccount>>,

    /// lottery NFT token escrow account
    #[account(
        mut,
        seeds = [Escrow::SEED, Lottery::SEED, user_nft_ata.mint.as_ref()],
        bump,
    )]
    pub lottery_escrow: Box<Account<'info, TokenAccount>>,

    /// $BLOOD vault account
    #[account(
        mut,
        seeds = [LotteryVault::SEED],
        bump,
    )]
    pub lottery_vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// lottery state
    #[account(
        mut,
        seeds = [Lottery::SEED, user_nft_ata.mint.as_ref()],
        bump,
        constraint = !lottery.is_active @ GameError::LotteryAlreadyInUse,
    )]
    pub lottery: Box<Account<'info, Lottery>>,

    /// lottery pool
    #[account(
        seeds = [LotteryPool::SEED],
        bump,
        constraint = (clock::Clock::get().unwrap().unix_timestamp as u32) < lottery_pool.start_time @ GameError::LotteryAlreadyStarted,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// token program
    pub token_program: Program<'info, Token>,
}

impl<'info> StakeLottery<'info> {
    /// stake NFT for lottery
    pub fn process(&mut self) -> Result<()> {
        // stake user wallet
        self.lottery.user = self.user.key();
        self.lottery.is_active = true;

        // transfer $BLOOD to vault
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.user_reward_ata.to_account_info(),
                    to: self.lottery_vault.to_account_info(),
                    authority: self.user.to_account_info(),
                },
            ),
            LOTTERY_ENTER_FEE,
        )?;

        // transfer NFT to escrow
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.user_nft_ata.to_account_info(),
                    to: self.lottery_escrow.to_account_info(),
                    authority: self.user.to_account_info(),
                },
            ),
            1,
        )
    }
}
