use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

use crate::{states::*, traits::*};

/// gamble
#[derive(Accounts)]
#[repr(C)]
pub struct CreateGamble<'info> {
    /// initializer
    #[account(mut)]
    pub user: Signer<'info>,

    /// NFT mint
    pub nft_mint: Box<Account<'info, Mint>>,

    /// gamble state
    /// no need to check extra security here
    /// it's just creating gamble state account for an NFT
    #[account(
        init,
        seeds = [Gamble::SEED, b"NFT", nft_mint.key().as_ref()],
        bump,
        payer = user,
        space = Gamble::SPACE,
    )]
    pub gamble: Box<Account<'info, Gamble>>,

    /// system program
    pub system_program: Program<'info, System>,
}
