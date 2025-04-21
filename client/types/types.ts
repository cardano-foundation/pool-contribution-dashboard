import Big from "big.js";

export type SearchFilters = {
    poolId: string,
    epoch: number,
    margin: number,

}
 
export interface SearchFormProps {
    onSearch: (filters: SearchFilters) => void;
}

export interface EpochParams {
    poolId: string,
    epoch: number,
    margin: number,
}

export type PoolHistory = {
    epoch_no: number,
    active_stake: string,
    active_stake_pct: string,
    saturation_pct: number,
    block_cnt: object,
    delegator_cnt: number,
    margin: number,
    fixed_cost: string,
    pool_fees: string,
    deleg_rewards: string,
    member_rewards: object,
    epoch_ros: number
}

export type DelegatorStake = {
    stake_address: string,
    amount: string,
    epoch_no: number,
}

export type TokenomicStats = {
    epoch_no: number,
    circulation: string,
    treasury: string,
    reward: string,
    supply: string,
    reserves: string,
    fees: string,
    deposits_stake: string,
    deposits_drep: string,
    deposits_proposal: string
}

export type Delegator = {
    address: string,
    stake: Big,
    reward: Big
}

export type PoolOwnerHistory = {
    pool_id_bech32: string,
    stake_address: string,
    declared_pledge: string,
    epoch_no: number,
    active_stake: string
}