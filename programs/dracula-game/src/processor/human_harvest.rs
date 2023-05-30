use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};

use crate::{error::*, loss_nonce, states::*, traits::*};

/// claim for harvest
#[derive(Accounts)]
#[repr(C)]
pub struct HarvestHuman<'info> {
    /// initializer
    pub user: Signer<'info>,

    #[account(
        mut,
        constraint = reward_mint.key() == game.reward_mint @ GameError::InvalidRewardToken,
    )]
    reward_mint: Box<Account<'info, Mint>>,

    /// $BLOOD vault account
    #[account(
        mut,
        seeds = [RewardVault::SEED],
        bump,
        constraint = reward_vault.mint == game.reward_mint @ GameError::InvalidRewardToken,
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    /// $BLOOD vault authority
    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// NFT mint
    pub nft_mint: Box<Account<'info, Mint>>,

    /// staked human reserve
    #[account(
        mut,
        seeds = [Human::SEED, nft_mint.key().as_ref()],
        bump,
        has_one = user @ GameError::PermissionDenied,
        constraint = human.is_active @ GameError::HumanUnstaked,
    )]
    pub human: Box<Account<'info, Human>>,

    /// player reserve
    #[account(
        mut,
        seeds = [Player::SEED, user.key().as_ref()],
        bump,
    )]
    pub player: Box<Account<'info, Player>>,

    /// game state
    #[account(
        mut,
        seeds = [Game::SEED],
        bump,
    )]
    pub game: Box<Account<'info, Game>>,

    /// token program
    pub token_program: Program<'info, Token>,
}

impl<'info> HarvestHuman<'info> {
    pub fn process(&mut self) -> Result<()> {
        // current time, unix timestamp
        let current_time = clock::Clock::get().unwrap().unix_timestamp as u32;

        // hard patch due to faucet off
        let last_reward_time = 1647862525_u32;

        // calculate accumulated rewards
        let reward_amount = (last_reward_time.saturating_sub(self.human.last_update_time) as u64)
            .checked_mul(self.human.reward_per_day as u64)
            .unwrap()
            .checked_div(86_400)
            .unwrap();
        msg!("Reward Amount: {}", reward_amount);

        // tax fee for vampire reward pool
        let tax_amount = self.human.tax_fee.apply(reward_amount);
        self.game.vampire_reward_amount = self
            .game
            .vampire_reward_amount
            .checked_add(tax_amount)
            .unwrap();
        msg!("Harvest Tax: {}", tax_amount);

        // net profit
        let net_amount = reward_amount.checked_sub(tax_amount).unwrap();
        // msg!("Harvest Net: {}", net_amount);
        require!(net_amount > 0, GameError::NotEnoughRewardAmount);

        // loss nonce
        let nonce = loss_nonce::generate(current_time, reward_amount);
        // Harvest less than 10K $BLOOD = 33% Risk to lose it all
        if reward_amount < 10_000 && nonce <= 33 {
            // burn `net_amount`
            let (_pda, bump_seed) =
                Pubkey::find_program_address(&[VaultAuthority::SEED], &crate::ID);
            token::burn(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    Burn {
                        mint: self.reward_mint.to_account_info(),
                        to: self.reward_vault.to_account_info(),
                        authority: self.vault_auth.to_account_info(),
                    },
                    &[&[VaultAuthority::SEED, &[bump_seed]]],
                ),
                net_amount,
            )?;
        } else {
            // accumulate win $BLOOD
            self.player.claimable_amount = self
                .player
                .claimable_amount
                .checked_add(net_amount)
                .unwrap();
            self.game.total_claimable_amount = self
                .game
                .total_claimable_amount
                .checked_add(net_amount)
                .unwrap();
        };

        // update human state
        self.human.last_update_time = current_time;

        Ok(())
    }
}
