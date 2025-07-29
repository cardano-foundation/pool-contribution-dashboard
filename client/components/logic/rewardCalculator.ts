import { EpochParams, PoolHistory, DelegatorStake, TokenomicStats, Delegator, PoolOwnerHistory } from "@/types/types";
import Big from "big.js";


export function calculateRewards(epochParams: EpochParams, poolHistory: PoolHistory[], delegatorStake: DelegatorStake[], tokenomicStats: TokenomicStats[], poolOwnerHistory: PoolOwnerHistory[]): Delegator[] {
     
    //Using the pool fees and the rewards delegated to the members (including the operator) to get the total rewards of that epoch
    const poolReward: Big = Big(poolHistory[0].pool_fees).add(Big(poolHistory[0].deleg_rewards));

    const fixedCost: Big = Big(poolHistory[0].fixed_cost);

    //TODO! Currently using 0.03 as this seems to be the median maring in most epochs but more testing is needed.
    const margin: Big = Big(epochParams.margin);

    const poolStake: Big = Big(poolHistory[0].active_stake);

    //Constant from the Protocol
    const totalLovelace: Big = Big("45000000000000000");

    const reserveFromLastEpoch: Big = Big(tokenomicStats[0].reserves);

    const adaInCirculation: Big = totalLovelace.minus(reserveFromLastEpoch);

    //Some delegators have a stake of 0. These need to be filtered out.
    for (let i = delegatorStake.length - 1; i >= 0; i--) {
        if (Big(delegatorStake[i].amount).eq(Big(0))) {
            delegatorStake.splice(i, 1);
        }
    }

    //Filtering the Pool Owner from the the delegator List
    let ownerStakeAddress = "no address";

    //Get the pool owner address for that epoch
    for (let i = poolOwnerHistory.length - 1; i >= 0; i--){
        if (poolOwnerHistory[i].epoch_no == epochParams.epoch) {
            ownerStakeAddress = poolOwnerHistory[i].stake_address;
        }
    }
    
    //If an address was found the corresponding delegator gets filtered out
    if (ownerStakeAddress !== "no address") {
        for (let i = delegatorStake.length - 1; i >= 0; i--) {
            if (delegatorStake[i].stake_address === ownerStakeAddress) {
                delegatorStake.splice(i, 1);
            }
        }
    }
  
    console.log("Reserve in last epoch: " + reserveFromLastEpoch);
    console.log("Used pool stake: " + poolStake);
    console.log("Calculated relative stake: " + poolStake.div(adaInCirculation));
    console.log("Current pool reward: " + poolReward);
    console.log("Used margin: " + margin);
    console.log("This much ada is currently in curculation: " + adaInCirculation);
    console.log("In epoch " + epochParams.epoch + " there were " + delegatorStake.length + " delegators to this pool.");
    console.log("Stake address of owner is: " + ownerStakeAddress);
    
    //Calculating the rewards

    const delegatorRewards: Delegator[] = [];

    //If rewards are smaller than the pool costs
    if (poolReward.plus(fixedCost).lte(fixedCost)){
        delegatorRewards.push({address: "", stake: Big(0), reward: Big(0)})
        return delegatorRewards;
    }

    //Calculating the rewards for each delegator
    for (const delegator of delegatorStake) {

        const reward = calculateReward(poolReward, fixedCost, margin, poolStake, adaInCirculation, Big(delegator.amount));

        delegatorRewards.push({address: delegator.stake_address, stake: Big(delegator.amount), reward: reward.round(0, 0)});
    }

    //Testing if the rest of the pool rewards that were not spent on delegators equals the pool owner reward

    let addedReward: Big = Big(0);

    for (const reward of delegatorRewards) {
        addedReward = addedReward.plus(reward.reward);
    }

    console.log("Total reward is: " + addedReward + ". Rest of the pool reward is: " + poolReward.minus(addedReward));

    return delegatorRewards;


}

export function calculateRewardForOneDelegator (epochParams: EpochParams, poolHistory: PoolHistory[], delegatorStake: DelegatorStake[], tokenomicStats: TokenomicStats[], poolOwnerHistory: PoolOwnerHistory[], delegatorAddress: string): Delegator {

    //Using the pool fees and the rewards delegated to the members (including the operator) to get the total rewards of that epoch
    const poolReward: Big = Big(poolHistory[0].pool_fees).add(Big(poolHistory[0].deleg_rewards));

    const fixedCost: Big = Big(poolHistory[0].fixed_cost);

    //TODO! Currently using 0.03 as this seems to be the median maring in most epochs but more testing is needed.
    const margin: Big = Big(epochParams.margin);

    const poolStake: Big = Big(poolHistory[0].active_stake);

    //Constant from the Protocol
    const totalLovelace: Big = Big("45000000000000000");

    const reserveFromLastEpoch: Big = Big(tokenomicStats[0].reserves);

    const adaInCirculation: Big = totalLovelace.minus(reserveFromLastEpoch);

    //Hier pruefen, ob der Delegator in der angefragten Epoche ueberhaupt gestaked hat. Falls nicht, dann einfach nichts als reward zurueck geben. 

    //console.log(delegatorStake.length);

    for (let i = 0; i < delegatorStake.length; i++){
        //console.log(delegatorAddress)
        if (delegatorStake[i].stake_address == delegatorAddress) {

            //console.log("stake " + delegatorStake[i].amount);

            const reward = calculateReward(poolReward, fixedCost, margin, poolStake, adaInCirculation, Big(delegatorStake[i].amount));

            //console.log("reward " + reward)
            return ({address: delegatorAddress, stake: Big(delegatorStake[i].amount), reward: reward})

        }
    }

    //Unsure if best solution
    return ({address: delegatorAddress, stake: Big(0), reward: Big(0)});

}

export function roundToAda (lovelace: Big): Big {
    let ada: string = lovelace.toString();
    if (ada.length > 6) {
        ada = ada.substring(0, ada.length - 6);
    }
    return Big(ada)
}

export function bigToFloat(lovelace: Big): number {
    const intPart = Math.floor(lovelace.toNumber() / 1_000_000);
    const mantissaPart = lovelace.toNumber() % 1_000_000;

    return Number(`${intPart}.${mantissaPart.toString().padStart(6, '0')}`);
}

function calculateReward (poolReward: Big, fixedCost: Big, margin: Big, poolStake: Big, adaInCirculation: Big, delegatorStake: Big): Big {
    const m1 = poolReward.minus(fixedCost);
    const m2 = (Big(1).minus(margin));
    const div1 = (poolStake.div(adaInCirculation));
    const div2 = (Big(delegatorStake).div(adaInCirculation));
    const m3 = (div2.div(div1));

    const reward = (m1.times(m2)).times(m3);
    return reward;
}