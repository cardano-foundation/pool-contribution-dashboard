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
    mode: string,
    epoch_no: number,
    active_stake: string,
    active_stake_pct: string,
    saturation_pct: number,
    block_cnt: number,
    delegator_cnt: number,
    fixed_cost: string,
    pool_fees: string,
    deleg_rewards: string,
    member_rewards: object,
    epoch_ros: number,
    fees: string,
    total_block_count: string,
    total_active_stake: string,
    reserves: string,
    influence: number,
    decentralisation: number,
    optimal_pool_count: number,
    monetary_expand_rate: number,
    treasury_growth_rate: number
    pledge: string,
    epoch_length_in_slots: string,
    active_slot_coeff: string,
    margin: number,
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

export type graphData = {
    name: string,
    stake: number,
    reward: number
}

export type RewardData = {
    delegator: string,
    stake: string, 
    reward: string
}

export type RewardDataArray = RewardData[][]

export type CachedData = {
    epoch: string,
    payload: RewardDataArray
}

export type BarChartData = {
    name: string, 
    epoch: number,
    reward: number
}

export type ExchangeValue = {
    cardano: {
        usd: number
    }
}