use anchor_lang::prelude::*;

use crate::{states::*, traits::*};

/// create player reserve account
#[derive(Accounts)]
#[repr(C)]
pub struct CreatePlayer<'info> {
    /// initializer
    #[account(mut)]
    pub user: Signer<'info>,

    /// player reserve
    #[account(
        init,
        seeds = [Player::SEED, user.key().as_ref()],
        bump,
        payer = user,
        space = Player::SPACE,
    )]
    pub player: Box<Account<'info, Player>>,

    /// system program
    pub system_program: Program<'info, System>,
}

impl<'info> CreatePlayer<'info> {
    pub fn process(&mut self) -> Result<()> {
        self.player.claimable_amount = 0;
        self.player.total_humans = 0;
        self.player.total_vampires = 0;

        Ok(())
    }
}

/// create player reserve account
#[derive(Accounts)]
#[instruction(user: Pubkey)]
#[repr(C)]
pub struct ClosePlayer<'info> {
    /// initializer
    #[account(mut)]
    pub admin: Signer<'info>,

    /// player reserve
    #[account(
        mut,
        seeds = [Player::SEED, user.as_ref()],
        bump,
        close = admin,
    )]
    pub player: Box<Account<'info, Player>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = admin,
    )]
    pub game: Box<Account<'info, Game>>,
}
