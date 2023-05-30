pub trait HasSpace: Sized {
    const SPACE: usize = 8 + std::mem::size_of::<Self>();
}

pub trait HasSeed {
    const SEED: &'static [u8];
}
