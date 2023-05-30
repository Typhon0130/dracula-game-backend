use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
#[repr(C)]
pub struct CreateOrUpdateGenArgs {
    /// Merkle root
    pub merkle_root: [u8; 32],

    /// Gen index
    pub gen_index: u8,
}

#[account]
#[derive(Default)]
#[repr(C)]
pub struct StakeArgs {
    /// Merkle proof
    pub proof: Vec<[u8; 32]>,

    /// leaf index
    pub index: u64,

    /// NFT kind
    pub nft_kind: u8,
}

#[account]
#[derive(Default)]
#[repr(C)]
pub struct RefreshLotteryPoolArgs {
    /// start time
    pub start_time: u32,

    /// end time
    pub end_time: u32,
}
