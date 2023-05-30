use anchor_lang::prelude::*;

use crate::{fees::*, traits::*};

/// Game details
#[account]
#[repr(C)]
pub struct Game {
    /// admin key
    pub admin: Pubkey,

    /// update authority key
    pub bot: Pubkey,

    /// reward mint, $BLOOD
    pub reward_mint: Pubkey,

    /// total $BLOOD amount not claimed yet
    pub total_claimable_amount: u64,

    /// reward amount should be distributed to vampires
    /// rewards will be distributed by bot
    pub vampire_reward_amount: u64,

    /// total staked humans
    pub total_humans: u32,

    /// last staked vampires
    pub total_vampires: u32,

    /// emergency flag
    pub emergency_flag: bool,
}

/// Dracula NFT generation
/// verify Human w/ blood group and/or Vampire when users stake NFTs
#[account]
#[repr(C)]
pub struct Gen {
    /// merkle root for NFTs in a generation
    pub merkle_root: [u8; 32],

    /// generation number, 0 - 3
    pub index: u8,
}

/// Player reserve account
#[account]
#[repr(C)]
pub struct Player {
    /// $BLOOD amount not claimed yet
    pub claimable_amount: u64,

    /// total staked humans
    pub total_humans: u32,

    /// total staked vampires
    pub total_vampires: u32,
}

/// Human stake reserve account
#[account]
#[repr(C)]
pub struct Human {
    /// stake authority
    pub user: Pubkey,

    /// staked NFT mint address
    pub mint: Pubkey,

    /// minimum harvested amount to unstake
    pub min_unstake_amount: u64,

    /// reward amount in $BLOOD per day
    pub reward_per_day: u32,

    /// last harvested/staked time, unix timestamp
    pub last_update_time: u32,

    /// unstake tax
    pub tax_fee: Fee,

    /// loss chance
    pub loss_chance: u8,

    /// false, if unstaked
    pub is_active: bool,

    /// use to distinguish human from vampire since both has the same size
    /// always set to false
    pub is_vampire: bool,

    /// generation index
    pub gen_index: u8,
}

/// Vampire stake reserve account
#[account]
#[repr(C)]
pub struct Vampire {
    /// stake authority
    pub user: Pubkey,

    /// staked NFT mint address
    pub mint: Pubkey,

    /// harvested reward amount in $BLOOD
    pub reward_amount: u64,

    /// minimum harvested amount to unstake
    pub min_unstake_amount: u64,

    /// unstake tax
    pub tax_fee: Fee,

    /// loss chance
    pub loss_chance: u8,

    /// false, if unstaked
    pub is_active: bool,

    /// use to distinguish vampire from human since both has the same size
    /// always set to true
    pub is_vampire: bool,

    /// generation index
    pub gen_index: u8,
}

/// Gamble state for NFT
#[account]
#[repr(C)]
pub struct Gamble {
    /// last gambled time, unix timestamp
    pub last_update_time: u32,

    /// gamble count
    pub count: u8,
}

/// lottery pool state
#[account]
#[repr(C)]
pub struct LotteryPool {
    /// lottery pool bot
    pub bot: Pubkey,

    /// game start time
    pub start_time: u32,

    /// game end time
    pub end_time: u32,
}

/// lottery state for NFT
#[account]
#[repr(C)]
pub struct Lottery {
    /// NFT owner address
    pub user: Pubkey,

    /// NFT mint address
    pub mint: Pubkey,

    /// NFT kind
    pub kind: u8,

    /// NFT generation
    pub gen_index: u8,

    /// lottery active flag
    pub is_active: bool,
}

#[derive(Debug, Clone)]
pub struct LotteryVault;

#[derive(Debug, Clone)]
pub struct RewardVault;

#[derive(Debug, Clone)]
pub struct VaultAuthority;

#[derive(Debug, Clone)]
pub struct Escrow;

impl HasSpace for Game {}
impl HasSpace for Gen {}
impl HasSpace for Player {}
impl HasSpace for Human {}
impl HasSpace for Vampire {}
impl HasSpace for Gamble {}
impl HasSpace for LotteryPool {}
impl HasSpace for Lottery {}

impl HasSeed for Game {
    const SEED: &'static [u8] = b"dracula-game";
}
impl HasSeed for Gen {
    const SEED: &'static [u8] = b"dracula-gen";
}
impl HasSeed for Player {
    const SEED: &'static [u8] = b"dracula-player";
}
impl HasSeed for Human {
    const SEED: &'static [u8] = b"dracula-human";
}
impl HasSeed for Vampire {
    const SEED: &'static [u8] = b"dracula-vampire";
}
impl HasSeed for Gamble {
    const SEED: &'static [u8] = b"dracula-gamble";
}
impl HasSeed for LotteryPool {
    const SEED: &'static [u8] = b"dracula-lottery-pool";
}
impl HasSeed for Lottery {
    const SEED: &'static [u8] = b"dracula-lottery";
}
impl HasSeed for LotteryVault {
    const SEED: &'static [u8] = b"dracula-lottery-vault";
}
impl HasSeed for RewardVault {
    const SEED: &'static [u8] = b"dracula-reward-vault";
}
impl HasSeed for VaultAuthority {
    const SEED: &'static [u8] = b"dracula-vault-auth";
}
impl HasSeed for Escrow {
    const SEED: &'static [u8] = b"dracula-escrow";
}
