use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

use crate::{error::*, loss_nonce, states::*, traits::*};

/// unstake Vampire
#[derive(Accounts)]
#[repr(C)]
pub struct UnstakeVampire<'info> {
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

    /// NFT vampire account
    #[account(mut)]
    pub nft_ata: Box<Account<'info, TokenAccount>>,

    /// NFT escrow account
    #[account(
        mut,
        seeds = [Escrow::SEED, nft_ata.mint.as_ref()],
        bump,
    )]
    pub nft_escrow: Box<Account<'info, TokenAccount>>,

    /// staked vampire reserve
    #[account(
        mut,
        seeds = [Vampire::SEED, nft_ata.mint.as_ref()],
        bump,
        has_one = user @ GameError::PermissionDenied,
        // hard patch due to faucet off
        // constraint = vampire.reward_amount >= vampire.min_unstake_amount @ GameError::NotEnoughRewardAmount,
        constraint = vampire.is_active @ GameError::VampireUnstaked,
    )]
    pub vampire: Box<Account<'info, Vampire>>,

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

impl<'info> UnstakeVampire<'info> {
    pub fn process(&mut self) -> Result<()> {
        // current time, unix timestamp
        let current_time = clock::Clock::get().unwrap().unix_timestamp as u32;

        // loss nonce
        let nonce = loss_nonce::generate(current_time, self.vampire.reward_amount);
        // msg!("Reward amount: {}", self.vampire.reward_amount);
        // msg!("Current time: {}", current_time);
        // msg!("Loss nonce: {}", nonce);

        // loss chance
        // let burn_amount = if nonce > self.vampire.loss_chance {
        //     // tax fee to burn
        //     let tax_amount = self.vampire.tax_fee.apply(self.vampire.reward_amount);

        //     // net profit
        //     let net_amount = self.vampire.reward_amount.checked_sub(tax_amount).unwrap();

        //     // accumulate win $BLOOD
        //     self.player.claimable_amount = self
        //         .player
        //         .claimable_amount
        //         .checked_add(net_amount)
        //         .unwrap();
        //     self.game.total_claimable_amount = self
        //         .game
        //         .total_claimable_amount
        //         .checked_add(net_amount)
        //         .unwrap();

        //     tax_amount
        // } else {
        //     // burn all rewards
        //     self.vampire.reward_amount
        // };

        // burn $BLOOD
        // hard patch due to faucet off
        // if burn_amount > 0 {
        //     let (_pda, bump_seed) =
        //         Pubkey::find_program_address(&[VaultAuthority::SEED], &crate::ID);
        //     token::burn(
        //         CpiContext::new_with_signer(
        //             self.token_program.to_account_info(),
        //             Burn {
        //                 mint: self.reward_mint.to_account_info(),
        //                 to: self.reward_vault.to_account_info(),
        //                 authority: self.vault_auth.to_account_info(),
        //             },
        //             &[&[VaultAuthority::SEED, &[bump_seed]]],
        //         ),
        //         burn_amount,
        //     )?;
        // }
        if nonce > self.vampire.loss_chance {
            // tax fee to burn
            let tax_amount = self.vampire.tax_fee.apply(self.vampire.reward_amount);

            // net profit
            let net_amount = self.vampire.reward_amount.checked_sub(tax_amount).unwrap();

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
        }

        // update vampire state
        self.vampire.reward_amount = 0;
        self.vampire.is_active = false;

        // update player state
        self.player.total_vampires = self.player.total_vampires.saturating_sub(1);

        // update game state
        self.game.total_vampires = self.game.total_vampires.saturating_sub(1);

        // authority bump seed
        let (_pda, bump_seed) =
            Pubkey::find_program_address(&[Vampire::SEED, self.nft_ata.mint.as_ref()], &crate::ID);

        // transfer NFT from escrow to user
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.nft_escrow.to_account_info(),
                    to: self.nft_ata.to_account_info(),
                    authority: self.vampire.to_account_info(),
                },
                &[&[Vampire::SEED, self.nft_ata.mint.as_ref(), &[bump_seed]]],
            ),
            1,
        )
    }
}
