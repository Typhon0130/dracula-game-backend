use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer},
};

use crate::{args::*, error::*, fees::*, merkle_proof, states::*, traits::*};

// /// create vampire reserve account
// #[derive(Accounts)]
// #[repr(C)]
// pub struct CreateVampire<'info> {
//     /// initializer
//     #[account(mut)]
//     pub user: Signer<'info>,

//     /// NFT mint
//     pub nft_mint: Box<Account<'info, Mint>>,

//     /// NFT escrow account
//     #[account(
//         init,
//         seeds = [Escrow::SEED, nft_mint.key().as_ref()],
//         bump,
//         payer = user,
//         token::mint = nft_mint,
//         token::authority = vampire,
//     )]
//     pub nft_escrow: Box<Account<'info, TokenAccount>>,

//     /// staked vampire reserve
//     #[account(
//         init,
//         seeds = [Vampire::SEED, nft_mint.key().as_ref()],
//         bump,
//         payer = user,
//         space = Vampire::SPACE,
//     )]
//     pub vampire: Box<Account<'info, Vampire>>,

//     /// system program
//     pub system_program: Program<'info, System>,

//     /// token program
//     pub token_program: Program<'info, Token>,

//     /// rent var
//     pub rent: Sysvar<'info, Rent>,
// }

// impl<'info> CreateVampire<'info> {
//     pub fn process(&mut self) -> Result<()> {
//         self.vampire.mint = self.nft_mint.key();
//         self.vampire.is_active = false;
//         self.vampire.is_vampire = true;

//         Ok(())
//     }
// }

// /// stake Vampire
// #[derive(Accounts)]
// #[repr(C)]
// pub struct StakeVampire<'info> {
//     /// initializer
//     pub user: Signer<'info>,

//     /// $BLOOD vault account
//     #[account(
//         mut,
//         seeds = [RewardVault::SEED],
//         bump,
//         constraint = reward_vault.mint == game.reward_mint @ GameError::InvalidRewardToken,
//     )]
//     pub reward_vault: Box<Account<'info, TokenAccount>>,

//     /// NFT vampire account
//     #[account(mut)]
//     pub nft_ata: Box<Account<'info, TokenAccount>>,

//     /// NFT escrow account
//     #[account(
//         mut,
//         seeds = [Escrow::SEED, nft_ata.mint.as_ref()],
//         bump,
//     )]
//     pub nft_escrow: Box<Account<'info, TokenAccount>>,

//     /// staked vampire reserve
//     #[account(
//         mut,
//         seeds = [Vampire::SEED, nft_ata.mint.as_ref()],
//         bump,
//         constraint = !vampire.is_active @ GameError::VampireStaked,
//     )]
//     pub vampire: Box<Account<'info, Vampire>>,

//     /// player reserve
//     #[account(
//         mut,
//         seeds = [Player::SEED, user.key().as_ref()],
//         bump,
//     )]
//     pub player: Box<Account<'info, Player>>,

//     /// game state
//     #[account(
//         mut,
//         seeds = [Game::SEED],
//         bump,
//         constraint = game.total_claimable_amount < reward_vault.amount @ GameError::NotEnoughFaucetBalance,
//     )]
//     pub game: Box<Account<'info, Game>>,

//     /// generation state
//     #[account(
//         seeds = [Gen::SEED, &[gen.index]],
//         bump,
//     )]
//     pub gen: Box<Account<'info, Gen>>,

//     /// token program
//     pub token_program: Program<'info, Token>,
// }

// impl<'info> StakeVampire<'info> {
//     pub fn process(&mut self, args: StakeArgs) -> Result<()> {
//         // verify the merkle proof.
//         let node = anchor_lang::solana_program::keccak::hashv(&[
//             &args.index.to_le_bytes(),
//             &self.nft_ata.mint.to_bytes(),
//             &[args.nft_kind],
//             &[self.gen.index],
//         ]);
//         require!(
//             merkle_proof::verify(args.proof, self.gen.merkle_root, node.0),
//             GameError::InvalidVampire
//         );

//         // configure tax, loss_chance, min_unstake_amount
//         self.vampire.tax_fee = Fee {
//             basis_points: *[0, 1_000, 1_500, 1_000]
//                 .get(self.gen.index as usize)
//                 .unwrap(),
//         };
//         self.vampire.loss_chance = *[20, 30, 30, 20].get(self.gen.index as usize).unwrap();
//         self.vampire.min_unstake_amount = 20_000;
//         self.vampire.user = self.user.key();
//         self.vampire.is_active = true;
//         self.vampire.gen_index = self.gen.index;

//         // max NFT count is 40k, no overflow
//         self.player.total_vampires = self.player.total_vampires.saturating_add(1);
//         self.game.total_vampires = self.game.total_vampires.saturating_add(1);

//         // transfer NFT to escrow
//         token::transfer(
//             CpiContext::new(
//                 self.token_program.to_account_info(),
//                 Transfer {
//                     from: self.nft_ata.to_account_info(),
//                     to: self.nft_escrow.to_account_info(),
//                     authority: self.user.to_account_info(),
//                 },
//             ),
//             1,
//         )
//     }
// }

/// close vampire reserve account
#[derive(Accounts)]
#[repr(C)]
pub struct CloseVampire<'info> {
    /// admin
    #[account(mut)]
    pub admin: Signer<'info>,

    /// NFT mint
    pub nft_mint: Box<Account<'info, Mint>>,

    /// CHECK: no need to check, believe in bot
    pub user: UncheckedAccount<'info>,

    /// user's NFT token ATA
    /// CHECK: no need to check, believe in admin
    #[account(mut)]
    pub user_nft_ata: UncheckedAccount<'info>,

    /// NFT escrow account
    #[account(
        mut,
        seeds = [Escrow::SEED, nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_escrow: Box<Account<'info, TokenAccount>>,

    /// staked vampire reserve
    #[account(
        mut,
        seeds = [Vampire::SEED, nft_mint.key().as_ref()],
        bump,
        close = admin,
    )]
    pub vampire: Box<Account<'info, Vampire>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = admin,
    )]
    pub game: Box<Account<'info, Game>>,

    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,

    /// token program
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> CloseVampire<'info> {
    pub fn process(&mut self, vampire_bump: u8) -> Result<()> {
        if self.nft_escrow.amount == 1 {
            if self.user_nft_ata.to_account_info().data_is_empty() {
                // create a new NFT account
                associated_token::create(CpiContext::new(
                    self.associated_token_program.to_account_info(),
                    associated_token::Create {
                        payer: self.admin.to_account_info(),
                        associated_token: self.user_nft_ata.to_account_info(),
                        authority: self.admin.to_account_info(),
                        mint: self.nft_mint.to_account_info(),
                        system_program: self.system_program.to_account_info(),
                        token_program: self.token_program.to_account_info(),
                        rent: self.rent.to_account_info(),
                    },
                ))?;
            }

            token::transfer(
                CpiContext::new_with_signer(
                    self.token_program.to_account_info(),
                    Transfer {
                        from: self.nft_escrow.to_account_info(),
                        to: self.user_nft_ata.to_account_info(),
                        authority: self.vampire.to_account_info(),
                    },
                    &[&[Vampire::SEED, self.nft_mint.key().as_ref(), &[vampire_bump]]],
                ),
                1,
            )?;
        }

        token::close_account(CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.nft_escrow.to_account_info(),
                destination: self.admin.to_account_info(),
                authority: self.vampire.to_account_info(),
            },
            &[&[Vampire::SEED, self.nft_mint.key().as_ref(), &[vampire_bump]]],
        ))
    }
}
