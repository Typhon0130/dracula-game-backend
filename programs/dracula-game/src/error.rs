use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Access denied")]
    AccessDenied,

    #[msg("Permission denied")]
    PermissionDenied,

    #[msg("Human staked")]
    HumanStaked,

    #[msg("Human unstaked")]
    HumanUnstaked,

    #[msg("Vampire staked")]
    VampireStaked,

    #[msg("Vampire unstaked")]
    VampireUnstaked,

    #[msg("Invalid reward token")]
    InvalidRewardToken,

    #[msg("Invalid beneficiary account")]
    InvalidBeneficiaryAccount,

    #[msg("Invalid human")]
    InvalidHuman,

    #[msg("Invalid vampire")]
    InvalidVampire,

    #[msg("Gamble cooldown not ready")]
    GambleCooldownNotReady,

    #[msg("Not enough reward amount")]
    NotEnoughRewardAmount,

    #[msg("Not enough claimable amount")]
    NotEnoughClaimableAmount,

    #[msg("Not enough faucet balance")]
    NotEnoughFaucetBalance,

    #[msg("Invalid NFT owner")]
    InvalidNFTOwner,

    #[msg("Invalid token owner")]
    InvalidTokenOwner,

    #[msg("Insufficient NFT balance")]
    InsufficientNFTBalance,

    #[msg("Insufficient token balance")]
    InsufficientTokenBalance,

    #[msg("Lottery already started")]
    LotteryAlreadyStarted,

    #[msg("Lottery already in use")]
    LotteryAlreadyInUse,
}
