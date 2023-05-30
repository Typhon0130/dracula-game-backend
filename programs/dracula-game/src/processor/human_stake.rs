use anchor_lang::{prelude::*, solana_program::clock};
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer},
};

use crate::{args::*, constant::*, error::*, fees::*, merkle_proof, states::*, traits::*};

// /// create human reserve account
// #[derive(Accounts)]
// #[repr(C)]
// pub struct CreateHuman<'info> {
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
//         token::authority = human,
//     )]
//     pub nft_escrow: Box<Account<'info, TokenAccount>>,

//     /// staked human reserve
//     #[account(
//         init,
//         seeds = [Human::SEED, nft_mint.key().as_ref()],
//         bump,
//         payer = user,
//         space = Human::SPACE,
//     )]
//     pub human: Box<Account<'info, Human>>,

//     /// system program
//     pub system_program: Program<'info, System>,

//     /// token program
//     pub token_program: Program<'info, Token>,

//     /// rent var
//     pub rent: Sysvar<'info, Rent>,
// }

// impl<'info> CreateHuman<'info> {
//     pub fn process(&mut self) -> Result<()> {
//         self.human.mint = self.nft_mint.key();
//         self.human.is_active = false;
//         self.human.is_vampire = false;

//         Ok(())
//     }
// }

// /// stake Human
// #[derive(Accounts)]
// #[repr(C)]
// pub struct StakeHuman<'info> {
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

//     /// NFT human account
//     #[account(mut)]
//     pub nft_ata: Box<Account<'info, TokenAccount>>,

//     /// NFT escrow account
//     #[account(
//         mut,
//         seeds = [Escrow::SEED, nft_ata.mint.as_ref()],
//         bump,
//     )]
//     pub nft_escrow: Box<Account<'info, TokenAccount>>,

//     /// staked human reserve
//     #[account(
//         mut,
//         seeds = [Human::SEED, nft_ata.mint.as_ref()],
//         bump,
//         constraint = !human.is_active @ GameError::HumanStaked,
//     )]
//     pub human: Box<Account<'info, Human>>,

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

// impl<'info> StakeHuman<'info> {
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
//             GameError::InvalidHuman
//         );

//         // configure tax, loss_chance, min_unstake_amount
//         match args.nft_kind {
//             NFT_HUMAN_O => {
//                 self.human.reward_per_day = 14_000;
//                 self.human.min_unstake_amount = *[84_000, 84_000, 56_000, 35_000]
//                     .get(self.gen.index as usize)
//                     .unwrap();
//                 self.human.tax_fee = Fee {
//                     basis_points: *[2_500, 3_000, 3_000, 2_500]
//                         .get(self.gen.index as usize)
//                         .unwrap(),
//                 };
//                 self.human.loss_chance = *[30, 30, 35, 40].get(self.gen.index as usize).unwrap();
//             }
//             NFT_HUMAN_A => {
//                 self.human.reward_per_day = 10_000;
//                 self.human.min_unstake_amount = *[40_000, 40_000, 30_000, 20_000]
//                     .get(self.gen.index as usize)
//                     .unwrap();
//                 self.human.tax_fee = Fee {
//                     basis_points: *[2_000, 2_500, 2_500, 2_000]
//                         .get(self.gen.index as usize)
//                         .unwrap(),
//                 };
//                 self.human.loss_chance = *[40, 40, 45, 50].get(self.gen.index as usize).unwrap();
//             }
//             NFT_HUMAN_B => {
//                 self.human.reward_per_day = 8_000;
//                 self.human.min_unstake_amount = *[16_000, 16_000, 12_000, 8_000]
//                     .get(self.gen.index as usize)
//                     .unwrap();
//                 self.human.tax_fee = Fee {
//                     basis_points: *[1_500, 2_000, 2_000, 1_500]
//                         .get(self.gen.index as usize)
//                         .unwrap(),
//                 };
//                 self.human.loss_chance = *[50, 50, 55, 60].get(self.gen.index as usize).unwrap();
//             }
//             _ => return Err(error!(GameError::InvalidHuman)),
//         }
//         self.human.user = self.user.key();
//         self.human.last_update_time = clock::Clock::get().unwrap().unix_timestamp as u32;
//         self.human.is_active = true;
//         self.human.gen_index = self.gen.index;

//         // max NFT count is 40k, no overflow
//         self.player.total_humans = self.player.total_humans.saturating_add(1);
//         self.game.total_humans = self.game.total_humans.saturating_add(1);

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

/// close human reserve account
#[derive(Accounts)]
#[repr(C)]
pub struct CloseHuman<'info> {
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

    /// staked human reserve
    #[account(
        mut,
        seeds = [Human::SEED, nft_mint.key().as_ref()],
        bump,
        close = admin,
    )]
    pub human: Box<Account<'info, Human>>,

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

impl<'info> CloseHuman<'info> {
    pub fn process(&mut self, human_bump: u8) -> Result<()> {
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
                        authority: self.human.to_account_info(),
                    },
                    &[&[Human::SEED, self.nft_mint.key().as_ref(), &[human_bump]]],
                ),
                1,
            )?;
        }

        token::close_account(CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.nft_escrow.to_account_info(),
                destination: self.admin.to_account_info(),
                authority: self.human.to_account_info(),
            },
            &[&[Human::SEED, self.nft_mint.key().as_ref(), &[human_bump]]],
        ))
    }
}
