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

        case 'MEDIAN_MARGIN':
            globalServerData.delegatorRewardData = loadedState.delegatorRewardData
            globalServerData.ownerRewardData = loadedState.ownerRewardData

            globalServerData.allEpochsPoolMargins = loadedState.allEpochsPoolMargins
            globalServerData.allEpochsMedianMargins = loadedState.allEpochsMedianMargins

            //calculatorData
            globalServerData.calculatorData.margin = loadedState.calculatorData.margin

        case 'PERCENTAGE':

            //TODO!!
            break;

    }
}

async function startApp(appInstance) {

    await initializeData(); // Initialisiere die Daten des Servers

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