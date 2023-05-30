use anchor_lang::prelude::*;

declare_id!("DraGHJgLfwuJBvUx4vDtsEits7gveFzUvBR1h1osEEjk");

pub mod args;
pub mod constant;
pub mod error;
pub mod fees;
pub mod loss_nonce;
pub mod merkle_proof;
pub mod processor;
pub mod states;
pub mod traits;

use crate::{args::*, processor::*};

#[program]
pub mod dracula_game {
    use super::*;

    /// initialize game
    pub fn initialize(ctx: Context<Initialize>, bot: Pubkey) -> Result<()> {
        ctx.accounts.process(&bot)
    }

    /// create merkle root for Gen
    pub fn create_gen(ctx: Context<CreateGen>, args: CreateOrUpdateGenArgs) -> Result<()> {
        ctx.accounts.process(args)
    }

    /// update merkle root for Gen
    pub fn update_gen(ctx: Context<UpdateGen>, args: CreateOrUpdateGenArgs) -> Result<()> {
        ctx.accounts.process(args)
    }

    /// create lottery pool
    pub fn create_lottery_pool(ctx: Context<CreateLotteryPool>, bot: Pubkey) -> Result<()> {
        ctx.accounts.process(&bot)
    }
    pub fn refresh_lottery_pool(
        ctx: Context<RefreshLotteryPool>,
        args: RefreshLotteryPoolArgs,
    ) -> Result<()> {
        ctx.accounts.process(args)
    }
    pub fn reset_lottery_vault(ctx: Context<ResetLotteryVault>) -> Result<()> {
        ctx.accounts.process()
    }
    pub fn unstake_lottery(ctx: Context<UnstakeLottery>) -> Result<()> {
        ctx.accounts.process()
    }

    /// distribute lottery rewards
    pub fn distribute_lottery_reward(
        ctx: Context<DistributeLotteryReward>,
        amount: u64,
    ) -> Result<()> {
        ctx.accounts.process(amount)
    }

    /// refresh vampire, accumulate rewards every day by bot
    pub fn refresh_vampire(ctx: Context<RefreshVampire>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }

    /// refresh game, reduct distributed reward from accumulated total_vampire_reward by bot
    pub fn refresh_game(ctx: Context<RefreshGame>, amount: u64) -> Result<()> {
        ctx.accounts.process(amount)
    }

    /// create player reserve account
    pub fn create_player(ctx: Context<CreatePlayer>) -> Result<()> {
        ctx.accounts.process()
    }
    pub fn close_player(_ctx: Context<ClosePlayer>, _user: Pubkey) -> Result<()> {
        Ok(())
    }

    /// create gamble state account
    pub fn create_gamble(_ctx: Context<CreateGamble>) -> Result<()> {
        Ok(())
    }

    // /// create human reserve account
    // pub fn create_human(ctx: Context<CreateHuman>) -> Result<()> {
    //     ctx.accounts.process()
    // }
    pub fn close_human(ctx: Context<CloseHuman>) -> Result<()> {
        let human_bump = *ctx.bumps.get("human").unwrap();
        ctx.accounts.process(human_bump)
    }

    // /// stake human
    // pub fn stake_human(ctx: Context<StakeHuman>, args: StakeArgs) -> Result<()> {
    //     ctx.accounts.process(args)
    // }

    /// unstake human
    pub fn unstake_human(ctx: Context<UnstakeHuman>) -> Result<()> {
        ctx.accounts.process()
    }

    /// gamble human
    pub fn gamble_human(ctx: Context<GambleHuman>) -> Result<()> {
        ctx.accounts.process()
    }

    /// harvest human
    pub fn harvest_human(ctx: Context<HarvestHuman>) -> Result<()> {
        ctx.accounts.process()
    }

    /// create vampire reserve account
    // pub fn create_vampire(ctx: Context<CreateVampire>) -> Result<()> {
    //     ctx.accounts.process()
    // }
    pub fn close_vampire(ctx: Context<CloseVampire>) -> Result<()> {
        let vampire_bump = *ctx.bumps.get("vampire").unwrap();
        ctx.accounts.process(vampire_bump)
    }

    // /// stake vampire
    // pub fn stake_vampire(ctx: Context<StakeVampire>, args: StakeArgs) -> Result<()> {
    //     ctx.accounts.process(args)
    // }

    /// unstake vampire
    pub fn unstake_vampire(ctx: Context<UnstakeVampire>) -> Result<()> {
        ctx.accounts.process()
    }

    /// gamble vampire
    pub fn gamble_vampire(ctx: Context<GambleVampire>) -> Result<()> {
        ctx.accounts.process()
    }

    /// harvest vampire
    pub fn harvest_vampire(ctx: Context<HarvestVampire>) -> Result<()> {
        ctx.accounts.process()
    }

    /// create lottery pda account
    pub fn create_lottery(ctx: Context<CreateLottery>, args: StakeArgs) -> Result<()> {
        ctx.accounts.process(args)
    }

    /// stake to lottery pool
    pub fn stake_lottery(ctx: Context<StakeLottery>) -> Result<()> {
        ctx.accounts.process()
    }

    /// claim for rewards accumulated in users profile
    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        ctx.accounts.process()
    }
}
