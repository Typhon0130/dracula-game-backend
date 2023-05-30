use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
#[repr(C)]
pub struct Fee {
    /// basis points (bp); 1% = 0.01 = 100bp
    pub basis_points: u32,
}

impl Fee {
    /// apply fee
    pub fn apply(&self, amount: u64) -> u64 {
        (amount as u128)
            .checked_mul(self.basis_points as u128)
            .unwrap()
            .checked_div(10_000)
            .unwrap() as u64
    }
}
