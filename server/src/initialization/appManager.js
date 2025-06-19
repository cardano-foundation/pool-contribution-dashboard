/**
 * @file This file initializes all data with koiosAPI.js and localDataManager
 * @fileoverview Initializes all data for calcualting the rewards and for the calculator data. Tries to load data from local storage first
 * If data from the current epoch is found, that gets used. If data from on epoch ago is found it can be updated. Else the data gets fetched new according to the 
 * mode set in .env.
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const { validateEnv, env } = require('../config/env');
const koiosApi = require('../services/koiosAPI');
const rewardCalculator = require('../services/rewardCalculator');
const localDataManager = require('../services/localDataManager');

let globalServerData = {
    currentEpoch: null
};

/**
 * Checks in which mode the server is running. Than checks if data needs to be loaded/fetched according to mode.
 * 
 * @returns {void}
 */
async function initializeData() {

    try {

        console.log('Data initialization is starting...');

        globalServerData.currentEpoch = await koiosApi.getCurrentEpoch()

        //Try loading current epochs state
        let loadedState = await localDataManager.loadFromJSON(`server_state_${env.MODE}_epoch_${globalServerData.currentEpoch}`)

        //If found
        if (loadedState) {

            await setGlobalServerData(loadedState, env.MODE)

            console.log("Local state for epoch " + globalServerData.currentEpoch + " was loaded.")

            //If not check for last epoch to see if an update can be run
        } else {
            console.log("No local state was found for epoch " + globalServerData.currentEpoch + ".")
            console.log("Checking if update is possible...")

            loadedState = await localDataManager.loadFromJSON(`server_state_${env.MODE}_epoch_${globalServerData.currentEpoch - 1}`)

            //If last epoch was found
            if (loadedState) {
                //Update is possible
                console.log("Update is possible.")

                //TODO!! Updating
                await updateOnEpochChange(globalServerData.currentEpoch, loadedState, env.MODE)

                await setGlobalServerData(loadedState, env.MODE)

                await localDataManager.saveToJSON(globalServerData, `server_state_${env.MODE}_epoch_${globalServerData.currentEpoch}`);

                console.log("Finished Updating. Epoch " + globalServerData.currentEpoch + " was loaded.")

                //If not local data was found
            } else {

                console.log("No local state found for epoch " + (globalServerData.currentEpoch - 1) + ". No update possible. Fetching new...")

                //Fetch all data from the koiosAPI and save it in globalServerData
                await fetchSpecificDataForMode(env.MODE)
                console.log("Finished fetching data. Saving locally...")

                //Save the data locally 
                await localDataManager.saveToJSON(globalServerData, `server_state_${env.MODE}_epoch_${globalServerData.currentEpoch}`);
                console.log("Finished saving. Starting server...")

            }
        }

    } catch (error) {
        throw new Error("Initializing data failed: " + error.message);
    }
}

/**
 * Fetches data according to the mode set in .env
 * @param {string} mode - the mode used for the server in .env 
 */
async function fetchSpecificDataForMode(mode) {

    console.log("Using mode " + mode)

    console.log(globalServerData.currentEpoch)

    //Parameters for all modes
    globalServerData.poolList = await koiosApi.getPoolList()
    globalServerData.poolHistoryOrderedByEpoch = await koiosApi.getPoolHistoryForENVPool();
    globalServerData.delegatorHistory = await koiosApi.getDelegatorHistoryForENVPool(globalServerData.currentEpoch)
    globalServerData.tokenomicStatsOrderedByEpoch = await koiosApi.getTokenomicStats()
    globalServerData.poolOwners = await koiosApi.getPoolOwnerHistoryForENVPool()

    //Parameters for calculator data in all modes
    globalServerData.calculatorData = {}
    globalServerData.calculatorData.mode = env.MODE

    //All from history
    globalServerData.calculatorData.epoch_no = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].epoch_no
    globalServerData.calculatorData.active_stake = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].active_stake
    globalServerData.calculatorData.active_stake_pct = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].active_stake_pct
    globalServerData.calculatorData.saturation_pct = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].saturation_pct
    globalServerData.calculatorData.block_cnt = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].block_cnt
    globalServerData.calculatorData.delegator_cnt = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].delegator_cnt
    globalServerData.calculatorData.fixed_cost = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].fixed_cost
    globalServerData.calculatorData.pool_fees = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].pool_fees
    globalServerData.calculatorData.deleg_rewards = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].deleg_rewards
    globalServerData.calculatorData.member_rewards = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].member_rewards
    globalServerData.calculatorData.epoch_ros = globalServerData.poolHistoryOrderedByEpoch[globalServerData.currentEpoch - 2].epoch_ros

    //currentEpoch - 2
    const epochHistory = await koiosApi.getEpochHistory(globalServerData.currentEpoch - 2)
    globalServerData.calculatorData.fees = epochHistory[0].fees
    globalServerData.calculatorData.total_block_count = epochHistory[0].blk_count
    globalServerData.calculatorData.total_active_stake = epochHistory[0].active_stake

    //currentEpoch - 1
    globalServerData.calculatorData.reserves = globalServerData.tokenomicStatsOrderedByEpoch[globalServerData.currentEpoch - 1].reserves

    //currentEpoch
    const currentProtocolParameters = await koiosApi.getProtocolParameters(globalServerData.currentEpoch)
    globalServerData.calculatorData.influence = currentProtocolParameters[0].influence
    globalServerData.calculatorData.decentralisation = currentProtocolParameters[0].decentralisation
    globalServerData.calculatorData.optimal_pool_count = currentProtocolParameters[0].optimal_pool_count
    globalServerData.calculatorData.monetary_expand_rate = currentProtocolParameters[0].monetary_expand_rate
    globalServerData.calculatorData.treasury_growth_rate = currentProtocolParameters[0].treasury_growth_rate

    //TODO!! better fetched over /pool_updates for currentEpoch - 2
    const currentPoolInfo = await koiosApi.getPoolInfo(env.POOL_ID)
    globalServerData.calculatorData.pledge = currentPoolInfo[0].pledge

    const genesisInfo = await koiosApi.getGenesisInfo()
    globalServerData.calculatorData.active_slot_coeff = genesisInfo[0].activeslotcoeff
    globalServerData.calculatorData.epoch_length_in_slots = genesisInfo[0].epochlength

    switch (mode) {
        case 'CUSTOM_MARGIN':

            const customMarginReward = await rewardCalculator.calculatePoolRewards(
                env.CUSTOM_MARGIN,
                globalServerData.currentEpoch,
                globalServerData.poolHistoryOrderedByEpoch,
                globalServerData.delegatorHistory,
                globalServerData.tokenomicStatsOrderedByEpoch,
                globalServerData.poolOwners)

            //For reward
            globalServerData.delegatorRewardData = customMarginReward.rewardData
            globalServerData.ownerRewardData = customMarginReward.ownerRewardData

            //For calculatorData
            globalServerData.calculatorData.margin = env.CUSTOM_MARGIN

            break;

        case 'MEDIAN_MARGIN':

            globalServerData.allEpochsPoolMargins = await koiosApi.getPoolMarginsForAllEpochs(globalServerData.poolList)
            globalServerData.allEpochsMedianMargins = await rewardCalculator.calculateMedianMargins(globalServerData.allEpochsPoolMargins)

            const medianMarginReward = await rewardCalculator.calculatePoolRewards(
                globalServerData.allEpochsMedianMargins,
                globalServerData.currentEpoch,
                globalServerData.poolHistoryOrderedByEpoch,
                globalServerData.delegatorHistory,
                globalServerData.tokenomicStatsOrderedByEpoch,
                globalServerData.poolOwners)

            //For reward
            globalServerData.delegatorRewardData = medianMarginReward.rewardData
            globalServerData.ownerRewardData = medianMarginReward.ownerRewardData

            //For calculatorData
            globalServerData.calculatorData.margin = globalServerData.allEpochsMedianMargins[globalServerData.currentEpoch - 2]

            break;

        case 'PERCENTAGE':

            //TODO!!
            break;

        default:

            throw new Error("Server tried to load data for the unsupported mode: " + mode)
    }
}

async function setGlobalServerData(loadedState, mode) {

    //reward data
    globalServerData.poolList = loadedState.poolList
    globalServerData.poolHistoryOrderedByEpoch = loadedState.poolHistoryOrderedByEpoch
    globalServerData.delegatorHistory = loadedState.delegatorHistory
    globalServerData.tokenomicStatsOrderedByEpoch = loadedState.tokenomicStatsOrderedByEpoch
    globalServerData.poolOwners = loadedState.poolOwners

    //calcualtor data
    globalServerData.calculatorData = {}
    globalServerData.calculatorData.mode = loadedState.calculatorData.mode

    //All from history
    globalServerData.calculatorData.epoch_no = loadedState.calculatorData.epoch_no
    globalServerData.calculatorData.active_stake = loadedState.calculatorData.active_stake
    globalServerData.calculatorData.active_stake_pct = loadedState.calculatorData.active_stake_pct
    globalServerData.calculatorData.saturation_pct = loadedState.calculatorData.saturation_pct
    globalServerData.calculatorData.block_cnt = loadedState.calculatorData.block_cnt
    globalServerData.calculatorData.delegator_cnt = loadedState.calculatorData.delegator_cnt
    globalServerData.calculatorData.fixed_cost = loadedState.calculatorData.fixed_cost
    globalServerData.calculatorData.pool_fees = loadedState.calculatorData.pool_fees
    globalServerData.calculatorData.deleg_rewards = loadedState.calculatorData.deleg_rewards
    globalServerData.calculatorData.member_rewards = loadedState.calculatorData.member_rewards
    globalServerData.calculatorData.epoch_ros = loadedState.calculatorData.epoch_ros

    //currentEpoch - 2
    globalServerData.calculatorData.fees = loadedState.calculatorData.fees
    globalServerData.calculatorData.total_block_count = loadedState.calculatorData.total_block_count
    globalServerData.calculatorData.total_active_stake = loadedState.calculatorData.total_active_stake

    //currentEpoch - 1
    globalServerData.calculatorData.reserves = loadedState.calculatorData.reserves

    //currentEpoch
    globalServerData.calculatorData.influence = loadedState.calculatorData.influence
    globalServerData.calculatorData.decentralisation = loadedState.calculatorData.decentralisation
    globalServerData.calculatorData.optimal_pool_count = loadedState.calculatorData.optimal_pool_count
    globalServerData.calculatorData.monetary_expand_rate = loadedState.calculatorData.monetary_expand_rate
    globalServerData.calculatorData.treasury_growth_rate = loadedState.calculatorData.treasury_growth_rate

    //TODO!! better fetched over /pool_updates for currentEpoch - 2
    globalServerData.calculatorData.pledge = loadedState.calculatorData.pledge

    globalServerData.calculatorData.active_slot_coeff = loadedState.calculatorData.active_slot_coeff
    globalServerData.calculatorData.epoch_length_in_slots = loadedState.calculatorData.epoch_length_in_slots


    switch (mode) {
        case 'CUSTOM_MARGIN':
            globalServerData.delegatorRewardData = loadedState.delegatorRewardData
            globalServerData.ownerRewardData = loadedState.ownerRewardData

            //calculatorData
            globalServerData.calculatorData.margin = loadedState.calculatorData.margin
            break;

        case 'MEDIAN_MARGIN':
            globalServerData.delegatorRewardData = loadedState.delegatorRewardData
            globalServerData.ownerRewardData = loadedState.ownerRewardData

            globalServerData.allEpochsPoolMargins = loadedState.allEpochsPoolMargins
            globalServerData.allEpochsMedianMargins = loadedState.allEpochsMedianMargins

            //calculatorData
            globalServerData.calculatorData.margin = loadedState.calculatorData.margin
            break;

        case 'PERCENTAGE':

            //TODO!!
            break;

        default:
            throw new Error("Given mode is not defined correctly")

    }
}

async function startApp(appInstance) {

    await initializeData(); // Initialisiere die Daten des Servers

}

/**
 * Checks the mode set in .env. Updates the locally stored data under specific conditions. 
 * When in MEDIAN_MARGIN mode:
 * - All blocks built in the epoch that needs to be calculated (currentEpoch - 2) are fetched
 * - Checks if a pool that is currently active has built a block in the epoch
 * - If so, its margin is used to calculate the new median
 * - The new margins get added to the localy stored files
 * 
 * @throws {Error} if no pool data could be accuired when fetching it new from KOIOS
 * @throws {Error} if something went wrong and the margins array is empty
 * @throws {Error} if a wrong mode is set in .env
 */
async function updateOnEpochChange(currentEpoch, loadedState, mode) {
    //When updated the epoch to calculate should be currentEpoch - 2

    //Get current epoch (Rewards can only be calculated for currentEpoch - 2)
    //This is used to get a list of all pools that ever were active in the staking process

    //In epoche 559 werden die Daten für epoche 557 berechnet (median margins)
    //Jedes Update sollte als die Epoche currentEpoch - 2 berechnen. 
    if (isNaN(currentEpoch)) {
        throw new Error("Given currentEpoch value isNaN")
    } else if (currentEpoch <= 0) {
        throw new Error("Given currentEpoch value is <= 0")
    }

    if (loadedState === null) {
        throw new Error("Given state is empty")
    }

    console.log(mode)

    if (!(mode === "CUSTOM_MARGIN" || mode === "MEDIAN_MARGIN" || mode === "PERCENTAGE")) {
        throw new Error("Mode is not set correctly.")
    }

    //Fetching general values

    console.log("Using mode " + mode)

    console.log("Updating to epoch: " + currentEpoch)

    //Parameters for all modes
    loadedState.poolList = await koiosApi.getPoolList()
    loadedState.poolHistoryOrderedByEpoch = await koiosApi.getPoolHistoryForENVPool();

    //TODO!! Test this 
    const newDelegatorHistory = koiosApi.getDelegatorHistoryForSpecificEpoch(currentEpoch)
    loadedState.delegatorHistory.push(newDelegatorHistory)

    loadedState.tokenomicStatsOrderedByEpoch = await koiosApi.getTokenomicStats()
    loadedState.poolOwners = await koiosApi.getPoolOwnerHistoryForENVPool()

    //Parameters for calculator data in all modes
    loadedState.calculatorData = {}
    loadedState.calculatorData.mode = mode

    //All from history
    loadedState.calculatorData.epoch_no = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].epoch_no
    loadedState.calculatorData.active_stake = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].active_stake
    loadedState.calculatorData.active_stake_pct = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].active_stake_pct
    loadedState.calculatorData.saturation_pct = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].saturation_pct
    loadedState.calculatorData.block_cnt = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].block_cnt
    loadedState.calculatorData.delegator_cnt = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].delegator_cnt
    loadedState.calculatorData.fixed_cost = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].fixed_cost
    loadedState.calculatorData.pool_fees = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].pool_fees
    loadedState.calculatorData.deleg_rewards = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].deleg_rewards
    loadedState.calculatorData.member_rewards = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].member_rewards
    loadedState.calculatorData.epoch_ros = loadedState.poolHistoryOrderedByEpoch[currentEpoch - 2].epoch_ros

    //currentEpoch - 2
    const epochHistory = await koiosApi.getEpochHistory(currentEpoch - 2)
    loadedState.calculatorData.fees = epochHistory[0].fees
    loadedState.calculatorData.total_block_count = epochHistory[0].blk_count
    loadedState.calculatorData.total_active_stake = epochHistory[0].active_stake

    //currentEpoch - 1
    loadedState.calculatorData.reserves = loadedState.tokenomicStatsOrderedByEpoch[currentEpoch - 1].reserves

    //currentEpoch
    const currentProtocolParameters = await koiosApi.getProtocolParameters(currentEpoch)
    loadedState.calculatorData.influence = currentProtocolParameters[0].influence
    loadedState.calculatorData.decentralisation = currentProtocolParameters[0].decentralisation
    loadedState.calculatorData.optimal_pool_count = currentProtocolParameters[0].optimal_pool_count
    loadedState.calculatorData.monetary_expand_rate = currentProtocolParameters[0].monetary_expand_rate
    loadedState.calculatorData.treasury_growth_rate = currentProtocolParameters[0].treasury_growth_rate

    //TODO!! better fetched over /pool_updates for currentEpoch - 2
    const currentPoolInfo = await koiosApi.getPoolInfo(env.POOL_ID)
    loadedState.calculatorData.pledge = currentPoolInfo[0].pledge

    const genesisInfo = await koiosApi.getGenesisInfo()
    loadedState.calculatorData.active_slot_coeff = genesisInfo[0].activeslotcoeff
    loadedState.calculatorData.epoch_length_in_slots = genesisInfo[0].epochlength



    switch (mode) {

        case 'CUSTOM_MARGIN':
            console.log("Updating custom margin rewards...")
            //await calculatePoolRewards(CUSTOM_MARGIN, currentEpoch)

            const customMarginReward = await rewardCalculator.calculatePoolRewards(
                env.CUSTOM_MARGIN,
                loadedState.currentEpoch,
                loadedState.poolHistoryOrderedByEpoch,
                loadedState.delegatorHistory,
                loadedState.tokenomicStatsOrderedByEpoch,
                loadedState.poolOwners)

            //For reward
            loadedState.delegatorRewardData = customMarginReward.rewardData
            loadedState.ownerRewardData = customMarginReward.ownerRewardData

            //For calculatorData
            loadedState.calculatorData.margin = env.CUSTOM_MARGIN
            break;

        case 'MEDIAN_MARGIN':
            console.log("Updating median margin rewards...")

            //Get all blocks that were made in the epoch
            const blocks = await koiosApi.getBlocksFromEpoch(currentEpoch - 2)

            console.log("There are " + blocks.length + " blocks in epoch " + (currentEpoch - 2) + ".")

            let margins = [];

            //If a pool from pool list, that is not retired has built a block in that epoch
            for (let i = 0; i < loadedState.poolList.length; i++) {
                //If pool is currently (two epochs after searched epoch) retired and did retire before or during the searched for epoch
                if (loadedState.poolList[i].pool_status === 'retired' && loadedState.poolList[i].retiring_epoch <= currentEpoch - 2) {
                    continue;
                } else {
                    //Check if the pool did build a block in the searched for epoch
                    for (let x = 0; x < blocks.length; x++) {
                        //If a block was build by the currently watched pool
                        if (blocks[x].pool === loadedState.poolList[i].pool_id_bech32) {
                            //Check for margin
                            //If margin was changed before or during current epoch, the margin in pool list should be up to date
                            if (loadedState.poolList[i].active_epoch_no <= currentEpoch - 2) {
                                //console.log("Can use margin from pool list.")
                                margins.push(loadedState.poolList[i].margin)
                                break;
                                //If pool was updated after currentEpoch - 2, the value in pool List is not up to date and must be fetched manually
                            } else {
                                let poolData = await koiosApi.getPoolHistoryForSpecificEpochAndSpecificPool(currentEpoch - 2, loadedState.poolList[i].pool_id_bech32)

                                if (!poolData) {
                                    throw new Error('No pool data was acquired.')
                                }

                                console.log(poolData[0].margin)
                                margins.push(poolData[0].margin)
                                break;
                            }
                        }
                    }
                }
            }

            if (!margins) {
                throw new Error('No margins were found')
            }

            //Update the all margins array
            loadedState.allEpochsPoolMargins.push(margins)

            //Calcualte median for the new epoch

            let median = 0;

            margins.sort((a, b) => a - b)
            let mid = Math.floor(margins.length / 2);
            if (margins.length % 2 !== 0) {
                median = margins[mid]
            } else {
                median = (margins[mid - 1] + margins[mid]) / 2
            }

            //Update the median margin array
            loadedState.allEpochsMedianMargins.push(median)

            //Recalculate the rewards
            const medianMarginReward = await rewardCalculator.calculatePoolRewards(
                loadedState.allEpochsMedianMargins,
                loadedState.currentEpoch,
                loadedState.poolHistoryOrderedByEpoch,
                loadedState.delegatorHistory,
                loadedState.tokenomicStatsOrderedByEpoch,
                loadedState.poolOwners)

            //For reward
            loadedState.delegatorRewardData = medianMarginReward.rewardData
            loadedState.ownerRewardData = medianMarginReward.ownerRewardData

            //For calculatorData
            loadedState.calculatorData.margin = loadedState.allEpochsMedianMargins[currentEpoch - 2]
            break;

        case 'PERCENTAGE':
            console.log("Updating percentage rewards...")
            //TODO!! Implement the percentage calculation

        default:
            throw new Error("Given mode is not setup correctly.")
    }
}

/**
 * Returns the globalServerData object that stores all the data,
 * that gets initialized on the server depending on its mode
 * @returns 
 */
async function getGlobalServerData() {

    return globalServerData;
}

module.exports = {
    startApp,
    getGlobalServerData
};