use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::{self, AssociatedToken},
    token::{self, Burn, CloseAccount, Mint, Token, TokenAccount, Transfer},
};

use crate::{args::*, states::*, traits::*};

/// calculate distributed rewards to vampires
#[derive(Accounts)]
#[repr(C)]
pub struct RefreshVampire<'info> {
    /// bot, signer
    pub bot: Signer<'info>,

    /// staked vampire reserve
    /// we trust in our bot
    #[account(mut)]
    pub vampire: Box<Account<'info, Vampire>>,

    /// game state
    #[account(
        seeds = [Game::SEED],
        bump,
        has_one = bot,
    )]
    pub game: Box<Account<'info, Game>>,
}

impl<'info> RefreshVampire<'info> {
    pub fn process(&mut self, amount: u64) -> Result<()> {
        if self.vampire.is_active && self.vampire.is_vampire {
            // accumulate reward amount
            self.vampire.reward_amount = self.vampire.reward_amount.checked_add(amount).unwrap();

            msg!("Vampire Owner: {}", self.vampire.user);
            msg!("Vampire Mint: {}", self.vampire.mint);
            msg!("Reward Amount: {}", amount);
        }

        Ok(())
    }
}

/// refresh game state after distribution for vampires
#[derive(Accounts)]
#[repr(C)]
pub struct RefreshGame<'info> {
    /// bot, signer
    pub bot: Signer<'info>,

    /// game state
    #[account(
        mut,
        seeds = [Game::SEED],
        bump,
        has_one = bot,
    )]
    pub game: Box<Account<'info, Game>>,
}

impl<'info> RefreshGame<'info> {
    pub fn process(&mut self, amount: u64) -> Result<()> {
        // reduct distributed amount
        self.game.vampire_reward_amount = self.game.vampire_reward_amount.saturating_sub(amount);

        Ok(())
    }
}

/// refresh lottery pool
#[derive(Accounts)]
#[repr(C)]
pub struct RefreshLotteryPool<'info> {
    /// bot, signer
    pub bot: Signer<'info>,

    /// lottery pool
    #[account(
        mut,
        seeds = [LotteryPool::SEED],
        bump,
        has_one = bot,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,
}

impl<'info> RefreshLotteryPool<'info> {
    pub fn process(&mut self, args: RefreshLotteryPoolArgs) -> Result<()> {
        self.lottery_pool.start_time = args.start_time;
        self.lottery_pool.end_time = args.end_time;

        Ok(())
    }
}

/// reset lottery vault
#[derive(Accounts)]
#[repr(C)]
pub struct ResetLotteryVault<'info> {
    /// bot, signer
    pub bot: Signer<'info>,

    /// BLOOD mint
    #[account(mut)]
    pub mint: Box<Account<'info, Mint>>,

    /// $BLOOD vault account
    #[account(
        mut,
        seeds = [LotteryVault::SEED],
        bump,
    )]
    pub lottery_vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// lottery pool
    #[account(
        seeds = [LotteryPool::SEED],
        bump,
        has_one = bot,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// token program
    pub token_program: Program<'info, Token>,
}

impl<'info> ResetLotteryVault<'info> {
    pub fn process(&self) -> Result<()> {
        // authority bump seed
        let (_pda, bump_seed) = Pubkey::find_program_address(&[VaultAuthority::SEED], &crate::ID);

        token::burn(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Burn {
                    mint: self.mint.to_account_info(),
                    to: self.lottery_vault.to_account_info(),
                    authority: self.vault_auth.to_account_info(),
                },
                &[&[VaultAuthority::SEED, &[bump_seed]]],
            ),
            self.lottery_vault.amount,
        )
    }
}

/// distribute lottery reward
#[derive(Accounts)]
#[repr(C)]
pub struct DistributeLotteryReward<'info> {
    /// bot, signer
    pub bot: Signer<'info>,

    /// beneficiary token account
    #[account(mut)]
    pub beneficiary: Box<Account<'info, TokenAccount>>,

    /// $BLOOD vault account
    #[account(
        mut,
        seeds = [LotteryVault::SEED],
        bump,
    )]
    pub lottery_vault: Box<Account<'info, TokenAccount>>,

    /// CHECK: PDA signer
    #[account(
        seeds = [VaultAuthority::SEED],
        bump,
    )]
    pub vault_auth: UncheckedAccount<'info>,

    /// lottery pool
    #[account(
        seeds = [LotteryPool::SEED],
        bump,
        has_one = bot,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    /// token program
    pub token_program: Program<'info, Token>,
}

impl<'info> DistributeLotteryReward<'info> {
    pub fn process(&self, amount: u64) -> Result<()> {
        // authority bump seed
        let (_pda, bump_seed) = Pubkey::find_program_address(&[VaultAuthority::SEED], &crate::ID);

        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.lottery_vault.to_account_info(),
                    to: self.beneficiary.to_account_info(),
                    authority: self.vault_auth.to_account_info(),
                },
                &[&[VaultAuthority::SEED, &[bump_seed]]],
            ),
            amount,
        )
    }
}

/// unstake lottery
#[derive(Accounts)]
#[repr(C)]
pub struct UnstakeLottery<'info> {
    /// bot
    pub bot: Signer<'info>,

    /// CHECK: no need to check, believe in bot
    pub user: UncheckedAccount<'info>,

    #[account(mut)]
    pub nft_mint: Box<Account<'info, Mint>>,

    /// user's NFT token ATA
    /// CHECK: no need to check, believe in bot
    #[account(mut)]
    pub user_nft_ata: UncheckedAccount<'info>,

    /// lottery NFT token escrow account
    #[account(
        mut,
        seeds = [Escrow::SEED, Lottery::SEED, nft_mint.key().as_ref()],
        bump,
    )]
    pub lottery_escrow: Box<Account<'info, TokenAccount>>,

    /// lottery state
    #[account(
        mut,
        seeds = [Lottery::SEED, nft_mint.key().as_ref()],
        bump,
        close = rent_payer,
    )]
    pub lottery: Box<Account<'info, Lottery>>,

    /// lottery pool
    #[account(
        seeds = [LotteryPool::SEED],
        bump,
        has_one = bot,
    )]
    pub lottery_pool: Box<Account<'info, LotteryPool>>,

    #[account(mut)]
    pub rent_payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,

    /// token program
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> UnstakeLottery<'info> {
    pub fn process(&mut self) -> Result<()> {
        // authority bump seed
        let (_pda, bump_seed) = Pubkey::find_program_address(
            &[Lottery::SEED, self.lottery_escrow.mint.as_ref()],
            &crate::ID,
        );

        let escrow_close_destination = if self.user_nft_ata.to_account_info().data_is_empty() {
            // create a new NFT account
            associated_token::create(CpiContext::new(
                self.associated_token_program.to_account_info(),
                associated_token::Create {
                    payer: self.rent_payer.to_account_info(),
                    associated_token: self.user_nft_ata.to_account_info(),
                    authority: self.user.to_account_info(),
                    mint: self.nft_mint.to_account_info(),
                    system_program: self.system_program.to_account_info(),
                    token_program: self.token_program.to_account_info(),
                    rent: self.rent.to_account_info(),
                },
            ))?;

            // if user does not have ATA, rent_payer should get escrow's rent exemption fee
            self.rent_payer.to_account_info()
        } else {
            // if user have ATA, user should get escrow's rent exemption fee
            self.user.to_account_info()
        };

        // transfer to user NFT account
        token::transfer(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.lottery_escrow.to_account_info(),
                    to: self.user_nft_ata.to_account_info(),
                    authority: self.lottery.to_account_info(),
                },
                &[&[
                    Lottery::SEED,
                    self.lottery_escrow.mint.as_ref(),
                    &[bump_seed],
                ]],
            ),
            1,
        )?;

        // close escrow account
        token::close_account(CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.lottery_escrow.to_account_info(),
                destination: escrow_close_destination,
                authority: self.lottery.to_account_info(),
            },
            &[&[
                Lottery::SEED,
                self.lottery_escrow.mint.as_ref(),
                &[bump_seed],
            ]],
        ))
    }
}
