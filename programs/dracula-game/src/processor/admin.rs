use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::{args::*, error::*, states::*, traits::*};

/// initialize game state
#[derive(Accounts)]
#[repr(C)]
pub struct Initialize<'info> {
    /// admin
    #[account(mut)]
    pub admin: Signer<'info>,

    /// $BLOOD token mint
    pub reward_mint: Box<Account<'info, Mint>>,

    /// $BLOOD vault account
    #[account(
        init,
        seeds = [RewardVault::SEED],
        bump,
        payer = admin,
        token::mint = reward_mint,
        token::authority = vault_auth,
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    /// $BLOOD vault authority
    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// game state
    #[account(
        init,
        seeds = [Game::SEED],
        bump,
        payer = admin,
        space = Game::SPACE,
    )]
    pub game: Box<Account<'info, Game>>,

    /// system program
    pub system_program: Program<'info, System>,

    /// token program
    pub token_program: Program<'info, Token>,

    /// rent var
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Initialize<'info> {
    pub fn process(&mut self, bot_key: &Pubkey) -> Result<()> {
        self.game.admin = self.admin.key();
        self.game.bot = *bot_key;

        self.game.reward_mint = self.reward_mint.key();

        self.game.total_claimable_amount = 0;
        self.game.vampire_reward_amount = 0;

        self.game.total_humans = 0;
        self.game.total_vampires = 0;

        self.game.emergency_flag = false;

        Ok(())
    }
}

/// create merkle root for generation
#[derive(Accounts)]
#[instruction(args: CreateOrUpdateGenArgs)]
#[repr(C)]
pub struct CreateGen<'info> {
    /// admin, signer
    #[account(mut)]
    pub admin: Signer<'info>,

    /// generation state
    #[account(
        init,
        seeds = [Gen::SEED, &[args.gen_index]],
        bump,
        payer = admin,
        space = Gen::SPACE,
    )]
    pub gen: Box<Account<'info, Gen>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = admin @ GameError::AccessDenied,
    )]
    pub game: Box<Account<'info, Game>>,

    /// system program
    pub system_program: Program<'info, System>,
}

impl<'info> CreateGen<'info> {
    pub fn process(&mut self, args: CreateOrUpdateGenArgs) -> Result<()> {
        self.gen.merkle_root = args.merkle_root;
        self.gen.index = args.gen_index;

        Ok(())
    }
}

/// update merkle root for generation
#[derive(Accounts)]
#[instruction(args: CreateOrUpdateGenArgs)]
#[repr(C)]
pub struct UpdateGen<'info> {
    /// admin, signer
    #[account(mut)]
    pub admin: Signer<'info>,

    /// generation state
    #[account(
        mut,
        seeds = [Gen::SEED, &[args.gen_index]],
        bump,
    )]
    pub gen: Box<Account<'info, Gen>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = admin @ GameError::AccessDenied,
    )]
    pub game: Box<Account<'info, Game>>,
}

impl<'info> UpdateGen<'info> {
    pub fn process(&mut self, args: CreateOrUpdateGenArgs) -> Result<()> {
        self.gen.merkle_root = args.merkle_root;

        Ok(())
    }
}

/// create lottery pool
#[derive(Accounts)]
#[repr(C)]
pub struct CreateLotteryPool<'info> {
    /// admin
    #[account(mut)]
    pub admin: Signer<'info>,

    /// $BLOOD token mint
    #[account(
        constraint = reward_mint.key() == game.reward_mint @ GameError::InvalidRewardToken,
    )]
    pub reward_mint: Box<Account<'info, Mint>>,

    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// $BLOOD vault account
    #[account(
        init,
        seeds = [LotteryVault::SEED],
        bump,
        payer = admin,
        token::mint = reward_mint,
        token::authority = vault_auth,
    )]
    pub lottery_vault: Box<Account<'info, TokenAccount>>,

    /// lottery pool
    #[account(
        init,
        seeds = [LotteryPool::SEED],
        bump,
        payer = admin,
        space = LotteryPool::SPACE,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = admin @ GameError::AccessDenied,
    )]
    pub game: Box<Account<'info, Game>>,

    /// system program
    pub system_program: Program<'info, System>,

    /// token program
    pub token_program: Program<'info, Token>,

    /// rent var
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> CreateLotteryPool<'info> {
    pub fn process(&mut self, bot: &Pubkey) -> Result<()> {
        self.lottery_pool.bot = *bot;

        Ok(())
    }
}
