/**
 * @file This file provides calualtion functions that use the fetched data from KOIOS
 * @fileoverview Allows calculating the rewards based on given margins and on percentage
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const Big = require('big.js');

/**
 * Calculates the Median of all the margins 
 * Index is epoch.
 * If no pools/blocks in an epoch == null
 *
 * @param {object} marginList - a list of all margins over all epochs from all pools
 * @param {number} currentEpoch - the current epoch for labeling the locally saved data
 * @returns {object} a list of median margins per epoch
 * @throws {Error} if something is wrong with the marginList
 * @throws {Error} if the given curretnEpoch isNaN
 */
async function calculateMedianMargins(marginList) {

    //Check marginList
    if (!marginList) {
        throw new Error('The given margin list for calculating the medians was falty.')
    }

    let medians = []
    for (let i = 0; i < marginList.length; i++) {
        //Filter out the epochs without pools/blocks
        if (marginList[i] != null && marginList[i] != []) {

            let margins = marginList[i].sort((a, b) => a - b)
            let mid = Math.floor(margins.length / 2);
            if (margins.length % 2 !== 0) {
                medians[i] = margins[mid]
            } else {
                medians[i] = (margins[mid - 1] + margins[mid]) / 2
            }
        } else {
            medians[i] = null
        }
    }
    return medians;
}

/**
 * Calculates the rewards for all delegators of a pool for all given epochs
 * @param {object} medians - can either be an array of median margins (length of 0-currentEpoch) or a number that gets applied to all epochs
 * @param {number} currentEpoch - the current epoch
 * @param {object} poolHistoryOrderedByEpoch - an array containing all pool histories where every epoch can be accessed by index
 * @param {object} delegatorHistory - all delegator histories as an array accessed by epoch as index
 * @param {object} tokenomicStatsOrderedByEpoch - all tokenomic stats for all epochs accessed by index
 * @param {object} poolOwnerHistory - the pool owner for every epoch accessed by epoch as index
 * @returns {{object, object}} - the data as an object containing {delegator reward, owner reward}
 */
async function calculatePoolRewards(medians, currentEpoch, poolHistoryOrderedByEpoch, delegatorHistory, tokenomicStatsOrderedByEpoch, poolOwnerHistory) {

    //Check currentEpoch type
    if (isNaN(currentEpoch)) {
        throw new Error('The given type of currentEpoch is not a number.')
    }

    if (!poolHistoryOrderedByEpoch || !delegatorHistory || !tokenomicStatsOrderedByEpoch || !poolOwnerHistory) {
        throw new Error('A parameter for reward calculation was not set correctly.')
    }

    //Check if medians is set correctly
    if (medians === null) {
        throw new Error('medians is not set.')
    } else {
        console.log("Using a " + typeof medians + " to calculate the rewards.")
        if (!(Array.isArray(medians) || (typeof medians === 'number' && !isNaN(medians)))) {

            throw new Error('Given type for medians was neither an array nor a number.')

        }
    }

    //Constant from the Protocol
    const totalLovelace = Big("45000000000000000");

    //DEBUG!!
    console.log("Pool history length: " + poolHistoryOrderedByEpoch.length)
    console.log("Delegator history length: " + delegatorHistory.length)
    console.log("Tokenomic stats length: " + tokenomicStatsOrderedByEpoch.length)
    console.log("Pool owner history length: " + poolOwnerHistory.length)

    //Calculate Epochs in which the pool was active
    /*
    Strucutre:
    [
      [{delegator: "...", stake: ..., reward: ...}, {...}, ...], <--- Epoche 0
      [{...}, {...}, ...], <--- Epoche 1
      ...
    ]
      
    */
    let rewardData = []

    let ownerRewardData = []

    //Every epoch needs an entry in the pool history array. The reward gets calcualted for every entry.
    //If no entry is found in an epoch, 0 gets entered as reward
    //If no block was build 0 get enteres as reward


    for (let i = 0; i < poolHistoryOrderedByEpoch.length; i++) {

        //Skip the epochs were the pool was not active

        if (poolHistoryOrderedByEpoch[i] == null) {
            continue;
        }

        //______Data for the calculation per epoch_____

        //Using the pool fees and the rewards delegated to the members (including the operator) to get the total rewards of that epoch
        let poolReward = Big(poolHistoryOrderedByEpoch[i].pool_fees).add(Big(poolHistoryOrderedByEpoch[i].deleg_rewards));

        let fixedCost = Big(poolHistoryOrderedByEpoch[i].fixed_cost);

        //Depends on type of medians that was given when calling the function

        let margin;

        if (Array.isArray(medians)) {
            //The calculation of rewards uses the margin that was active when the pool did the work.
            margin = Big(medians[poolHistoryOrderedByEpoch[i].epoch_no]);
        } else if (typeof medians === "number") {
            margin = medians
        } else {
            throw new Error("Something went wrong, when handling the margin data.")
        }

        //Must use the stake from the snapshot that was made.
        let poolStake = Big(poolHistoryOrderedByEpoch[i].active_stake);
        
        //Uses adaInCirculation from the epoch where the blocks were build
        let reserveFromLastEpoch = Big(tokenomicStatsOrderedByEpoch[i + 1].reserves);

        let adaInCirculation = totalLovelace.minus(reserveFromLastEpoch);

        //Initialize Delegator Array
        if (!Array.isArray(rewardData[poolHistoryOrderedByEpoch[i].epoch_no])) {
            rewardData[poolHistoryOrderedByEpoch[i].epoch_no] = []
        }

        //Initialize Owner Array
        if (!Array.isArray(ownerRewardData[poolHistoryOrderedByEpoch[i].epoch_no])) {
            ownerRewardData[poolHistoryOrderedByEpoch[i].epoch_no] = {}
        }

        //Find the owner in the currently viewed epoch
        let ownerStakeAddress = "";

        for (let x = poolOwnerHistory.length - 1; x >= 0; x--) {
            if (poolOwnerHistory[x].epoch_no == poolHistoryOrderedByEpoch[i].epoch_no) {
                ownerStakeAddress = poolOwnerHistory[x].stake_address;
            }
        }

        //The delegators that were active in the currenty viewed epoch
        let delegatorsThisEpoch = delegatorHistory[i]

        //For every delegator
        for (let x = 0; x < delegatorsThisEpoch.length; x++) {

            //Some delegators have a stake of 0. Those are filtered out.
            if (delegatorsThisEpoch[x].amount == "0") {
                continue;
            }

            //Check if the pool has actually build any blocks
            if (poolHistoryOrderedByEpoch[i].block_cnt === null || poolHistoryOrderedByEpoch[i].block_cnt === 0) {
                //If owner
                if (delegatorsThisEpoch[x].stake_address === ownerStakeAddress) {
                    ownerRewardData[poolHistoryOrderedByEpoch[i].epoch_no] = ({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, owner: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: "0" })
                    //If delegator
                } else {
                    rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, delegator: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: "0" })
                }
                //If it has build blocks
            } else {

                //If owner
                if (delegatorsThisEpoch[x].stake_address === ownerStakeAddress) {
                    //Part 1 of owner reward calculation
                    if (poolReward.lte(fixedCost)) {
                        ownerRewardData[poolHistoryOrderedByEpoch[i].epoch_no] = ({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, owner: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: String(poolReward) })
                        //Part 2
                    } else {

                        let relativeOwnerStake = Big(delegatorsThisEpoch[x].amount).div(adaInCirculation)
                        let relativePoolStake = Big(poolStake.div(adaInCirculation))

                        let m1 = poolReward.minus(fixedCost)
                        let m2 = Big(1).minus(margin)
                        let m3 = relativeOwnerStake.div(relativePoolStake)

                        let mul1 = m2.times(m3).add(margin)
                        let mul2 = m1.times(mul1).round(0, 1)

                        let ownerReward = mul2.add(fixedCost)

                        ownerRewardData[poolHistoryOrderedByEpoch[i].epoch_no] = ({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, owner: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: String(ownerReward) })

                    }

                //If delegator
                } else {
                    //Part 1 of the delegator rewards formula
                    if (poolReward.lte(fixedCost)) {
                        rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, index: i, delegator: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: "0" })
                    //If pool rewards are enough for delegator rewards
                    } else {

                        let m1 = poolReward.minus(fixedCost);
                        let m2 = (Big(1).minus(margin));
                        let div1 = (poolStake.div(adaInCirculation));
                        let div2 = (Big(delegatorsThisEpoch[x].amount).div(adaInCirculation));
                        let m3 = (div2.div(div1));

                        let reward = (m1.times(m2)).times(m3);
                        rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ epoch: poolHistoryOrderedByEpoch[i].epoch_no, index: i, delegator: delegatorsThisEpoch[x].stake_address, stake: String(delegatorsThisEpoch[x].amount), reward: String(reward.round(0, 1)) })
                    }
                }
            }
        }
    }

    return { rewardData, ownerRewardData }

}

//TODO!! Function needs to be updated with new data and calculation

/**
 * 
 * @param {*} currentEpoch 
 * @param {*} poolHistoryOrderedByEpoch 
 * @param {*} delegatorHistory 
 * @param {*} poolOwnerHistory 
 * @returns 
 */
async function calculateRewardViaPercentage(currentEpoch, poolHistoryOrderedByEpoch, delegatorHistory, poolOwnerHistory) {

    //TODO!! Validieren der parameter

    //Question is: is the reward just calcualted relative and the owner gets his share relativly too?
    //=> Calcualte reward for owner with cost + relative reward from pool stake in that epoch
    //=> Calcualte reward for member just by realtive reward from pool stake in that epoch

    //1. Get the owner to subtract his stake from the pool stake and the fixed cost from the reward value

    let rewardData = [];
    let ownerData = [];

    for (let i = 0; i < poolHistoryOrderedByEpoch.length; i++) {

        //Skip the epochs were the pool was not active
        if (poolHistoryOrderedByEpoch[i] == null) {
            //console.log("Epoche übersprungen")
            continue;
        }


        //Daten für die Berechnung, pro Epoche

        //Using the pool fees and the rewards delegated to the members (including the operator) to get the total rewards of that epoch
        let poolReward = Big(poolHistoryOrderedByEpoch[i].pool_fees).add(Big(poolHistoryOrderedByEpoch[i].deleg_rewards));

        let fixedCost = Big(poolHistoryOrderedByEpoch[i].fixed_cost);

        let poolStake = Big(poolHistoryOrderedByEpoch[i].active_stake);

        //Array initialisieren
        if (!Array.isArray(rewardData[poolHistoryOrderedByEpoch[i].epoch_no])) {
            rewardData[poolHistoryOrderedByEpoch[i].epoch_no] = []
        }

        if (!Array.isArray(ownerData[poolHistoryOrderedByEpoch[i].epoch_no])) {
            ownerData[poolHistoryOrderedByEpoch[i].epoch_no] = []
        }

        //Owner während der aktuell betrachteten Epoche finden
        let ownerStakeAddress = "";

        for (let x = poolOwnerHistory.length - 1; x >= 0; x--) {
            if (poolOwnerHistory[x].epoch_no == poolHistoryOrderedByEpoch[i].epoch_no) {
                ownerStakeAddress = poolOwnerHistory[x].stake_address;
            }
        }

        //Iteration über alle Delegator (Liste enthält alle Epochen und alle Delegator der Epochen ungeordnet)
        for (let x = 0; x < delegatorHistory.length; x++) {

            //Da die Delegator alle ein einer Langen Liste vorliegen und jeweils nur ein Feld mit der entsprechenden Epoche haben, wird über 
            //alle iteriert und jeder mit der passenden Epoche wird bearbeitet 
            if (delegatorHistory[x].epoch_no == i) {

                //Alle mit Stake 0 rausfiltern 
                if (delegatorHistory[x].amount == "0") {
                    //console.log("Stake = 0 in Epoche: " + poolHistoryOrderedByEpoch[i].epoch_no)
                    delegatorHistory.splice(x, 1)
                    x--;
                    continue;
                }

                //Prüfen, ob in der Epoche ein Block gebaut wurde. Wenn nicht, erhalten alle 0
                if (poolHistoryOrderedByEpoch[i].block_cnt == null || poolHistoryOrderedByEpoch[i].block_cnt == 0) {

                    //
                    if (delegatorHistory[x].stake_address == ownerStakeAddress) {
                        ownerData[poolHistoryOrderedByEpoch[i].epoch_no].push({ owner: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: "0" })
                        delegatorHistory.splice(x, 1)
                        x--;
                        continue;
                    }

                    //In das reward array wird bei index der Epoche ein Delegator mit reward 0 eingefügt 
                    rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ delegator: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: "0" })
                    //Anschließend wird der Delegator aus der Liste entfernt um nicht erneut durchlaufen werden zu müssen
                    delegatorHistory.splice(x, 1)
                    x--;

                    //Falls ein Block gebaut wurde, muss berechnet werden, wie hoch der reward des gefundenen Delegators ist
                } else {
                    if (poolReward.plus(fixedCost).lte(fixedCost)) {

                        //discern between owner and delegator
                        if (delegatorHistory[x].stake_address == ownerStakeAddress) {
                            //Unsure if fixed cost should be added here or not?
                            ownerData[poolHistoryOrderedByEpoch[i].epoch_no].push({ owner: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: String(poolReward.plus(fixedCost).round(0, 0)) })
                            delegatorHistory.splice(x, 1)
                            x--;
                            continue;
                        }

                        rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ delegator: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: "0" })
                        //Anschließend wird der Delegator aus der Liste entfernt um nicht erneut durchlaufen werden zu müssen
                        delegatorHistory.splice(x, 1)
                        x--;
                        continue;

                    } else {

                        //1. calculate relative stake of delegator
                        let relativeStake = Big(delegatorHistory[x].amount).div(poolStake)

                        //2. multiply with reward to get relative reward 
                        //fixed cost abziehen. Wird dann für den owner wieder addiert
                        let relativeReward = relativeStake.times(poolReward.minus(fixedCost))

                        //discern between owner and delegator aswell
                        if (delegatorHistory[x].stake_address == ownerStakeAddress) {
                            //Unsure if fixed cost should be added here or not?
                            ownerData[poolHistoryOrderedByEpoch[i].epoch_no].push({ owner: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: String((relativeReward.plus(fixedCost)).round(0, 0)) })
                            delegatorHistory.splice(x, 1)
                            x--;
                            continue;
                        }

                        rewardData[poolHistoryOrderedByEpoch[i].epoch_no].push({ delegator: delegatorHistory[x].stake_address, stake: String(delegatorHistory[x].amount), reward: String(relativeReward.round(0, 0)) })
                        //Anschließend wird der Delegator aus der Liste entfernt um nicht erneut durchlaufen werden zu müssen
                        delegatorHistory.splice(x, 1)
                        x--;
                        continue;

                    }
                }
            }
        }
    }

    return { rewardData, ownerData }

}

module.exports = {
    calculateMedianMargins,
    calculatePoolRewards,
    calculateRewardViaPercentage,
};