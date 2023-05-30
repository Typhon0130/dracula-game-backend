use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount};

use crate::{constant::*, error::*, loss_nonce, states::*, traits::*};

/// gamble with human
#[derive(Accounts)]
#[repr(C)]
pub struct GambleHuman<'info> {
    /// initializer
    pub user: Signer<'info>,

    /// reward mint
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
        constraint = reward_vault.mint == reward_mint.key() @ GameError::InvalidRewardToken,
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

    /// gamble state
    #[account(
        mut,
        seeds = [Gamble::SEED, b"NFT", nft_mint.key().as_ref()],
        bump,
    )]
    pub gamble: Box<Account<'info, Gamble>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
    )]
    pub game: Box<Account<'info, Game>>,

    /// token program
    pub token_program: Program<'info, Token>,
}

impl<'info> GambleHuman<'info> {
    pub fn process(&mut self) -> Result<()> {
        // current time, unix timestamp
        let current_time = clock::Clock::get().unwrap().unix_timestamp as u32;

        // hard patch due to faucet off
        let last_reward_time = 1647862525_u32;

        // check if gambling cooldown is ready
        // twice a day or in every 12hrs
        require!(
            current_time.saturating_sub(self.gamble.last_update_time) >= 43_200
                || self.gamble.count > 0,
            GameError::GambleCooldownNotReady,
        );

        // time passed since last harvest
        let delta_time = last_reward_time.saturating_sub(self.human.last_update_time);

        // calculate accumulated rewards
        let reward_amount = (delta_time as u64)
            .checked_mul(self.human.reward_per_day as u64)
            .unwrap()
            .checked_div(86_400)
            .unwrap();
        msg!("Reward Amount: {}", reward_amount);

        // loss nonce
        let nonce = loss_nonce::generate(current_time, reward_amount);

        // update human state
        if nonce > GAMBLING_LOSS_CHANCE {
            // win - x2
            self.human.last_update_time = self.human.last_update_time.saturating_sub(delta_time);
        } else {
            // loose - reset
            self.human.last_update_time = current_time;

            // burn `reward_amount`
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
                reward_amount,
            )?;
        }

        // update gamble state
        if self.gamble.count == 0 {
            self.gamble.last_update_time = current_time;
        }
        self.gamble.count = self.gamble.count.saturating_add(1) % GAMBLING_MAX_PER_TICK;

        Ok(())
    }
}
