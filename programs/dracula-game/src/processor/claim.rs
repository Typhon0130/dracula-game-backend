use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::{error::*, fees::*, states::*, traits::*};

/// claim for $BLOOD
#[derive(Accounts)]
#[repr(C)]
pub struct Claim<'info> {
    /// initializer
    pub user: Signer<'info>,

    /// beneficiary ATA
    #[account(
        mut,
        constraint = beneficiary_ata.owner == user.key() @ GameError::InvalidBeneficiaryAccount,
    )]
    beneficiary_ata: Box<Account<'info, TokenAccount>>,

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

    /// player reserve
    #[account(
        mut,
        seeds = [Player::SEED, user.key().as_ref()],
        bump,
        constraint = player.claimable_amount > 0 @ GameError::NotEnoughClaimableAmount,
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

impl<'info> Claim<'info> {
    pub fn process(&mut self) -> Result<()> {
        // calculate actual transfer amount
        let transfer_amount = if self.player.claimable_amount > 500_000 {
            // 15% extra $BLOOD if claim above 500K
            Fee {
                basis_points: 11_500,
            }
            .apply(self.player.claimable_amount)
        } else if self.player.claimable_amount > 250_000 {
            // 5% extra $BLOOD if claim above 250K
            Fee {
                basis_points: 10_500,
            }
            .apply(self.player.claimable_amount)
        } else if self.player.claimable_amount < 50_000 {
            // 25% extra tax if claim below 50K
            Fee {
                basis_points: 7_500,
            }
            .apply(self.player.claimable_amount)
        } else {
            self.player.claimable_amount
        };
        msg!("Claimable amount {}:", self.player.claimable_amount);
        msg!("Transfer amount {}:", transfer_amount);

        // update game state
        self.game.total_claimable_amount = self
            .game
            .total_claimable_amount
            .checked_sub(self.player.claimable_amount)
            .unwrap();

        // update player state
        self.player.claimable_amount = 0;

        // authority bump seed
        let (_pda, bump_seed) = Pubkey::find_program_address(&[VaultAuthority::SEED], &crate::ID);

        // TODO: burn tax_amount

        // transfer harvested $BLOOD
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.reward_vault.to_account_info(),
                    to: self.beneficiary_ata.to_account_info(),
                    authority: self.vault_auth.to_account_info(),
                },
                &[&[VaultAuthority::SEED, &[bump_seed]]],
            ),
            transfer_amount,
        )
    }
}
