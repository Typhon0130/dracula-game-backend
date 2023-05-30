export type DraculaGame = {
  version: "0.4.0";
  name: "dracula_game";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bot";
          type: "publicKey";
        }
      ];
    },
    {
      name: "createGen";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "gen";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "CreateOrUpdateGenArgs";
          };
        }
      ];
    },
    {
      name: "updateGen";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "gen";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "CreateOrUpdateGenArgs";
          };
        }
      ];
    },
    {
      name: "createLotteryPool";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lotteryVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "bot";
          type: "publicKey";
        }
      ];
    },
    {
      name: "refreshLotteryPool";
      accounts: [
        {
          name: "bot";
          isMut: false;
          isSigner: true;
        },
        {
          name: "lotteryPool";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "RefreshLotteryPoolArgs";
          };
        }
      ];
    },
    {
      name: "refreshVampire";
      accounts: [
        {
          name: "bot";
          isMut: false;
          isSigner: true;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "refreshGame";
      accounts: [
        {
          name: "bot";
          isMut: false;
          isSigner: true;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
    },
    {
      name: "createPlayer";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closePlayer";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "user";
          type: "publicKey";
        }
      ];
    },
    {
      name: "createGamble";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gamble";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createHuman";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeHuman";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "stakeHuman";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gen";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "StakeArgs";
          };
        }
      ];
    },
    {
      name: "unstakeHuman";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "nftAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "gambleHuman";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gamble";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "harvestHuman";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "human";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createVampire";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "closeVampire";
      accounts: [
        {
          name: "admin";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "stakeVampire";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gen";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "StakeArgs";
          };
        }
      ];
    },
    {
      name: "unstakeVampire";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "nftEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "gambleVampire";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gamble";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "harvestVampire";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "rewardMint";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vampire";
          isMut: true;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createLottery";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "nftMint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lotteryEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lottery";
          isMut: true;
          isSigner: false;
        },
        {
          name: "gen";
          isMut: false;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "args";
          type: {
            defined: "StakeArgs";
          };
        }
      ];
    },
    {
      name: "stakeLottery";
      accounts: [
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "userNftAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "userRewardAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lotteryEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lotteryVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "lottery";
          isMut: true;
          isSigner: false;
        },
        {
          name: "lotteryPool";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "claim";
      accounts: [
        {
          name: "user";
          isMut: false;
          isSigner: true;
        },
        {
          name: "beneficiaryAta";
          isMut: true;
          isSigner: false;
        },
        {
          name: "rewardVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vaultAuth";
          isMut: false;
          isSigner: false;
        },
        {
          name: "player";
          isMut: true;
          isSigner: false;
        },
        {
          name: "game";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "createOrUpdateGenArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "merkleRoot";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "genIndex";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "stakeArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "proof";
            type: {
              vec: {
                array: ["u8", 32];
              };
            };
          },
          {
            name: "index";
            type: "u64";
          },
          {
            name: "nftKind";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "refreshLotteryPoolArgs";
      type: {
        kind: "struct";
        fields: [
          {
            name: "startTime";
            type: "u32";
          },
          {
            name: "endTime";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "game";
      type: {
        kind: "struct";
        fields: [
          {
            name: "admin";
            type: "publicKey";
          },
          {
            name: "bot";
            type: "publicKey";
          },
          {
            name: "rewardMint";
            type: "publicKey";
          },
          {
            name: "totalClaimableAmount";
            type: "u64";
          },
          {
            name: "vampireRewardAmount";
            type: "u64";
          },
          {
            name: "totalHumans";
            type: "u32";
          },
          {
            name: "totalVampires";
            type: "u32";
          },
          {
            name: "emergencyFlag";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "gen";
      type: {
        kind: "struct";
        fields: [
          {
            name: "merkleRoot";
            type: {
              array: ["u8", 32];
            };
          },
          {
            name: "index";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "player";
      type: {
        kind: "struct";
        fields: [
          {
            name: "claimableAmount";
            type: "u64";
          },
          {
            name: "totalHumans";
            type: "u32";
          },
          {
            name: "totalVampires";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "human";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "minUnstakeAmount";
            type: "u64";
          },
          {
            name: "rewardPerDay";
            type: "u32";
          },
          {
            name: "lastUpdateTime";
            type: "u32";
          },
          {
            name: "taxFee";
            type: {
              defined: "Fee";
            };
          },
          {
            name: "lossChance";
            type: "u8";
          },
          {
            name: "isActive";
            type: "bool";
          },
          {
            name: "isVampire";
            type: "bool";
          },
          {
            name: "genIndex";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "vampire";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "rewardAmount";
            type: "u64";
          },
          {
            name: "minUnstakeAmount";
            type: "u64";
          },
          {
            name: "taxFee";
            type: {
              defined: "Fee";
            };
          },
          {
            name: "lossChance";
            type: "u8";
          },
          {
            name: "isActive";
            type: "bool";
          },
          {
            name: "isVampire";
            type: "bool";
          },
          {
            name: "genIndex";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "gamble";
      type: {
        kind: "struct";
        fields: [
          {
            name: "lastUpdateTime";
            type: "u32";
          },
          {
            name: "count";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "lotteryPool";
      type: {
        kind: "struct";
        fields: [
          {
            name: "bot";
            type: "publicKey";
          },
          {
            name: "startTime";
            type: "u32";
          },
          {
            name: "endTime";
            type: "u32";
          }
        ];
      };
    },
    {
      name: "lottery";
      type: {
        kind: "struct";
        fields: [
          {
            name: "user";
            type: "publicKey";
          },
          {
            name: "mint";
            type: "publicKey";
          },
          {
            name: "kind";
            type: "u8";
          },
          {
            name: "genIndex";
            type: "u8";
          },
          {
            name: "isActive";
            type: "bool";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "Fee";
      type: {
        kind: "struct";
        fields: [
          {
            name: "basisPoints";
            type: "u32";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "AccessDenied";
      msg: "Access denied";
    },
    {
      code: 6001;
      name: "PermissionDenied";
      msg: "Permission denied";
    },
    {
      code: 6002;
      name: "HumanStaked";
      msg: "Human staked";
    },
    {
      code: 6003;
      name: "HumanUnstaked";
      msg: "Human unstaked";
    },
    {
      code: 6004;
      name: "VampireStaked";
      msg: "Vampire staked";
    },
    {
      code: 6005;
      name: "VampireUnstaked";
      msg: "Vampire unstaked";
    },
    {
      code: 6006;
      name: "InvalidRewardToken";
      msg: "Invalid reward token";
    },
    {
      code: 6007;
      name: "InvalidBeneficiaryAccount";
      msg: "Invalid beneficiary account";
    },
    {
      code: 6008;
      name: "InvalidHuman";
      msg: "Invalid human";
    },
    {
      code: 6009;
      name: "InvalidVampire";
      msg: "Invalid vampire";
    },
    {
      code: 6010;
      name: "GambleCooldownNotReady";
      msg: "Gamble cooldown not ready";
    },
    {
      code: 6011;
      name: "NotEnoughRewardAmount";
      msg: "Not enough reward amount";
    },
    {
      code: 6012;
      name: "NotEnoughClaimableAmount";
      msg: "Not enough claimable amount";
    },
    {
      code: 6013;
      name: "NotEnoughFaucetBalance";
      msg: "Not enough faucet balance";
    },
    {
      code: 6014;
      name: "InvalidNFTOwner";
      msg: "Invalid NFT owner";
    },
    {
      code: 6015;
      name: "InvalidTokenOwner";
      msg: "Invalid token owner";
    },
    {
      code: 6016;
      name: "InsufficientNFTBalance";
      msg: "Insufficient NFT balance";
    },
    {
      code: 6017;
      name: "InsufficientTokenBalance";
      msg: "Insufficient token balance";
    },
    {
      code: 6018;
      name: "LotteryAlreadyStarted";
      msg: "Lottery already started";
    },
    {
      code: 6019;
      name: "LotteryAlreadyInUse";
      msg: "Lottery already in use";
    }
  ];
};

export const IDL: DraculaGame = {
  version: "0.4.0",
  name: "dracula_game",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bot",
          type: "publicKey",
        },
      ],
    },
    {
      name: "createGen",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "gen",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "CreateOrUpdateGenArgs",
          },
        },
      ],
    },
    {
      name: "updateGen",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "gen",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "CreateOrUpdateGenArgs",
          },
        },
      ],
    },
    {
      name: "createLotteryPool",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lotteryVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bot",
          type: "publicKey",
        },
      ],
    },
    {
      name: "refreshLotteryPool",
      accounts: [
        {
          name: "bot",
          isMut: false,
          isSigner: true,
        },
        {
          name: "lotteryPool",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "RefreshLotteryPoolArgs",
          },
        },
      ],
    },
    {
      name: "refreshVampire",
      accounts: [
        {
          name: "bot",
          isMut: false,
          isSigner: true,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "refreshGame",
      accounts: [
        {
          name: "bot",
          isMut: false,
          isSigner: true,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "createPlayer",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closePlayer",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "user",
          type: "publicKey",
        },
      ],
    },
    {
      name: "createGamble",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "gamble",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createHuman",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeHuman",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "stakeHuman",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gen",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "StakeArgs",
          },
        },
      ],
    },
    {
      name: "unstakeHuman",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "nftAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "gambleHuman",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gamble",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "harvestHuman",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "human",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createVampire",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "closeVampire",
      accounts: [
        {
          name: "admin",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "stakeVampire",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gen",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "StakeArgs",
          },
        },
      ],
    },
    {
      name: "unstakeVampire",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "nftEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "gambleVampire",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gamble",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "harvestVampire",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "rewardMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vampire",
          isMut: true,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createLottery",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "nftMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lotteryEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lottery",
          isMut: true,
          isSigner: false,
        },
        {
          name: "gen",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "args",
          type: {
            defined: "StakeArgs",
          },
        },
      ],
    },
    {
      name: "stakeLottery",
      accounts: [
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "userNftAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "userRewardAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lotteryEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lotteryVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "lottery",
          isMut: true,
          isSigner: false,
        },
        {
          name: "lotteryPool",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "claim",
      accounts: [
        {
          name: "user",
          isMut: false,
          isSigner: true,
        },
        {
          name: "beneficiaryAta",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vaultAuth",
          isMut: false,
          isSigner: false,
        },
        {
          name: "player",
          isMut: true,
          isSigner: false,
        },
        {
          name: "game",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "createOrUpdateGenArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "merkleRoot",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "genIndex",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "stakeArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "proof",
            type: {
              vec: {
                array: ["u8", 32],
              },
            },
          },
          {
            name: "index",
            type: "u64",
          },
          {
            name: "nftKind",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "refreshLotteryPoolArgs",
      type: {
        kind: "struct",
        fields: [
          {
            name: "startTime",
            type: "u32",
          },
          {
            name: "endTime",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "game",
      type: {
        kind: "struct",
        fields: [
          {
            name: "admin",
            type: "publicKey",
          },
          {
            name: "bot",
            type: "publicKey",
          },
          {
            name: "rewardMint",
            type: "publicKey",
          },
          {
            name: "totalClaimableAmount",
            type: "u64",
          },
          {
            name: "vampireRewardAmount",
            type: "u64",
          },
          {
            name: "totalHumans",
            type: "u32",
          },
          {
            name: "totalVampires",
            type: "u32",
          },
          {
            name: "emergencyFlag",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "gen",
      type: {
        kind: "struct",
        fields: [
          {
            name: "merkleRoot",
            type: {
              array: ["u8", 32],
            },
          },
          {
            name: "index",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "player",
      type: {
        kind: "struct",
        fields: [
          {
            name: "claimableAmount",
            type: "u64",
          },
          {
            name: "totalHumans",
            type: "u32",
          },
          {
            name: "totalVampires",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "human",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "minUnstakeAmount",
            type: "u64",
          },
          {
            name: "rewardPerDay",
            type: "u32",
          },
          {
            name: "lastUpdateTime",
            type: "u32",
          },
          {
            name: "taxFee",
            type: {
              defined: "Fee",
            },
          },
          {
            name: "lossChance",
            type: "u8",
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "isVampire",
            type: "bool",
          },
          {
            name: "genIndex",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "vampire",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "rewardAmount",
            type: "u64",
          },
          {
            name: "minUnstakeAmount",
            type: "u64",
          },
          {
            name: "taxFee",
            type: {
              defined: "Fee",
            },
          },
          {
            name: "lossChance",
            type: "u8",
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "isVampire",
            type: "bool",
          },
          {
            name: "genIndex",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "gamble",
      type: {
        kind: "struct",
        fields: [
          {
            name: "lastUpdateTime",
            type: "u32",
          },
          {
            name: "count",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "lotteryPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "bot",
            type: "publicKey",
          },
          {
            name: "startTime",
            type: "u32",
          },
          {
            name: "endTime",
            type: "u32",
          },
        ],
      },
    },
    {
      name: "lottery",
      type: {
        kind: "struct",
        fields: [
          {
            name: "user",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "kind",
            type: "u8",
          },
          {
            name: "genIndex",
            type: "u8",
          },
          {
            name: "isActive",
            type: "bool",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "Fee",
      type: {
        kind: "struct",
        fields: [
          {
            name: "basisPoints",
            type: "u32",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AccessDenied",
      msg: "Access denied",
    },
    {
      code: 6001,
      name: "PermissionDenied",
      msg: "Permission denied",
    },
    {
      code: 6002,
      name: "HumanStaked",
      msg: "Human staked",
    },
    {
      code: 6003,
      name: "HumanUnstaked",
      msg: "Human unstaked",
    },
    {
      code: 6004,
      name: "VampireStaked",
      msg: "Vampire staked",
    },
    {
      code: 6005,
      name: "VampireUnstaked",
      msg: "Vampire unstaked",
    },
    {
      code: 6006,
      name: "InvalidRewardToken",
      msg: "Invalid reward token",
    },
    {
      code: 6007,
      name: "InvalidBeneficiaryAccount",
      msg: "Invalid beneficiary account",
    },
    {
      code: 6008,
      name: "InvalidHuman",
      msg: "Invalid human",
    },
    {
      code: 6009,
      name: "InvalidVampire",
      msg: "Invalid vampire",
    },
    {
      code: 6010,
      name: "GambleCooldownNotReady",
      msg: "Gamble cooldown not ready",
    },
    {
      code: 6011,
      name: "NotEnoughRewardAmount",
      msg: "Not enough reward amount",
    },
    {
      code: 6012,
      name: "NotEnoughClaimableAmount",
      msg: "Not enough claimable amount",
    },
    {
      code: 6013,
      name: "NotEnoughFaucetBalance",
      msg: "Not enough faucet balance",
    },
    {
      code: 6014,
      name: "InvalidNFTOwner",
      msg: "Invalid NFT owner",
    },
    {
      code: 6015,
      name: "InvalidTokenOwner",
      msg: "Invalid token owner",
    },
    {
      code: 6016,
      name: "InsufficientNFTBalance",
      msg: "Insufficient NFT balance",
    },
    {
      code: 6017,
      name: "InsufficientTokenBalance",
      msg: "Insufficient token balance",
    },
    {
      code: 6018,
      name: "LotteryAlreadyStarted",
      msg: "Lottery already started",
    },
    {
      code: 6019,
      name: "LotteryAlreadyInUse",
      msg: "Lottery already in use",
    },
  ],
};
