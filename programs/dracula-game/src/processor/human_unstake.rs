use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{error::*, loss_nonce, states::*, traits::*};

/// unstake Human
#[derive(Accounts)]
#[repr(C)]
pub struct UnstakeHuman<'info> {
    /// initializer
    pub user: Signer<'info>,

    /// NFT human account
    #[account(mut)]
    pub nft_ata: Box<Account<'info, TokenAccount>>,

    /// NFT escrow account
    #[account(
        mut,
        seeds = [Escrow::SEED, nft_ata.mint.as_ref()],
        bump,
    )]
    pub nft_escrow: Box<Account<'info, TokenAccount>>,

    /// staked human reserve
    #[account(
        mut,
        seeds = [Human::SEED, nft_ata.mint.as_ref()],
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

impl<'info> UnstakeHuman<'info> {
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
        // hard patch due to faucet off
        // require!(
        //     reward_amount >= self.human.min_unstake_amount,
        //     GameError::NotEnoughRewardAmount
        // );

        // loss nonce
        let nonce = loss_nonce::generate(current_time, reward_amount);
        // msg!("Reward amount: {}", reward_amount);
        // msg!("Current time: {}", current_time);
        // msg!("Loss nonce: {}", nonce);

        // loss chance
        if nonce > self.human.loss_chance {
            // tax fee for vampire reward pool
            let tax_amount = self.human.tax_fee.apply(reward_amount);
            self.game.vampire_reward_amount = self
                .game
                .vampire_reward_amount
                .checked_add(tax_amount)
                .unwrap();

            // net profit
            let net_amount = reward_amount.checked_sub(tax_amount).unwrap();

            // accumulate win $BLOOD
            self.player.claimable_amount =
                self.player.claimable_amount.checked_add(net_amount).unwrap();
            self.game.total_claimable_amount = self
                .game
                .total_claimable_amount
                .checked_add(net_amount)
                .unwrap();
        } else {
            // goes to vampire reward pool
            self.game.vampire_reward_amount = self
                .game
                .vampire_reward_amount
                .checked_add(reward_amount)
                .unwrap();
        }

        // update human state
        self.human.is_active = false;

        // update player state
        self.player.total_humans = self.player.total_humans.saturating_sub(1);

        // update game state
        self.game.total_humans = self.game.total_humans.saturating_sub(1);

        // authority bump seed
        let (_pda, bump_seed) =
            Pubkey::find_program_address(&[Human::SEED, self.nft_ata.mint.as_ref()], &crate::ID);

        // transfer NFT from escrow to user
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.nft_escrow.to_account_info(),
                    to: self.nft_ata.to_account_info(),
                    authority: self.human.to_account_info(),
                },
                &[&[Human::SEED, self.nft_ata.mint.as_ref(), &[bump_seed]]],
            ),
            1,
        )
    }
}
