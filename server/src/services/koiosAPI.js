/**
 * @file This file provides functions for fetching specific data from KOIOS via the axiosInstance
 * @fileoverview This file provides functions for fetching the current epoch, the pool list, all blocks from an epoch, all pool margins for all epochs,
 * the pool history for the pool specified in .env, the delegator history for all epochs for the pool defined in .env, the tokenomic stats for all epochs,
 * the pool owner history for the .env pool, the protocol parameters for a specific epoch, the pool info for a specific pool, the geneisis infos of the network
 * and the epoch history for a specific epoch.
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const koiosAxios = require('../config/axiosInstance');
const { getViaAxiosPaginated } = require('../utils/helper');
const { env } = require('../config/env');

/**
 * Returns the current epoch number from KOIOS
 * @returns {string} the number of the current epoch
 */
async function getCurrentEpoch() {
    const response = await koiosAxios.get('/tip');
    return response.data[0].epoch_no;
}

/**
 * Returns the pool list array of the current epoch paginated and checked for duplicates
 * @returns {object} the pool list array of the current epoch checked for duplicates
 */
async function getPoolList() {
    console.log("Delivering pool list...")
    const response = await getViaAxiosPaginated('/pool_list?_', "pool_id_bech32");
    return response;
}

/**
 * Allows fetching the blocks of a specific epoch and returns them in an array
 * @param {number} epochNo - the number of the epoch from which the blocks must be fetched
 * @returns {object} the array conatining all blocks for an epoch
 * @throws {Error} if the given epoch isNaN or <= 0
 */
async function getBlocksFromEpoch(epochNo) {

    if (isNaN(epochNo) || epochNo < 0) {
        throw new Error("EpochNo is not a number or smaller than 0.")
    }

    try {
        let recieving = true;
        let dataList = []
        const limit = 1000;
        let offset = 0;

        //Tries to fetch blocks until an epoch change is detected in the recieved data
        while (recieving) {
            let page = await koiosAxios.get(env.API_URL + "/blocks?_" + `&offset=${offset}&limit=${limit}`)

            const chunk = page.data;

            let check = false;

            //Check for changing epochNo in array
            for (let i = 0; i < chunk.length; i++) {

                //To filter the two epochs before the given epoch. The recieved blocks from KOIOS start with current epoch but we need current epoch - 2.
                //If the last value of the chunk is still bigger than the searched for epoch, the whole chunk can be discarded
                if (chunk[chunk.length - 1].epoch_no > epochNo) {
                    check = true;
                } else {
                    check = false;
                }

                //If the value changes inside the chunk, the chunk until the change can be discarded
                if (i > 0) {
                    if (chunk[i].epoch_no === epochNo && chunk[i - 1].epoch_no === epochNo + 1) {
                        chunk.splice(0, i)
                        continue;
                    }
                }


                //If the next lower epoch no is found
                if (chunk[i].epoch_no === epochNo - 1) {
                    recieving = false;
                    //Splice everything after that
                    chunk.splice(i);
                    continue;
                }
            }

            if (!check) {
                dataList.push(...chunk);
            }

            offset += limit;
        }

        return dataList;

    } catch (paginatedError) {
        throw new Error('Error occured during paginated fetching of data.' + paginatedError.message)
    }

}

/**
 * Get the history of all pools. The histories contain the margin. 
 * This function results in ~6000 API calls and should ony be run once when the server ist first started.
 * Can take up to half an hour.
 * 
 * @param {object} poolList - an array containing all pools from which the margins should be fetched
 * @returns {object} epochList - a list of all margins of all pools sorted by epoch
 * @throws {Error} if poolList is empty
 * @throws {Error} if currentEpoch isNaN
 * @throws {Error} if something went wrong during fetching from KOIOS
 */
async function getPoolMarginsForAllEpochs(poolList) {

    //Check poolList variable
    if (!poolList) {
        throw new Error('The given poolList for recieving all pool histories was falty.')
    }

    let epochList = []

    try {

        //Itterates over all pools 
        for (let i = 0; i < poolList.length; i++) {

            console.log("Fetching pool " + (i + 1) + "/" + (poolList.length) + "...")

            //Save the history of every single pool (Contains the margin in every epoch that the pool was active in)
            let historyList = await koiosAxios.get(`${env.API_URL}/pool_history?_pool_bech32=${poolList[i].pool_id_bech32}`)

            if (!historyList) {
                throw new Error('Recieved pool history list in epoch ' + i + " was empty or false.")
            }

            //Structure of the array that is built
            /*
            
              {[
                  margin,
                  margin,
                  ...
               ],
               [
                  margin,
                  margin,
                  ...
               ],
               ...
              }
            
              The Index of the array is the epoch
        
            */
            for (let x = 0; x < historyList.length; x++) {
                //Initialize a new array at the index, so it can be pushed in
                if (!Array.isArray(epochList[historyList[x].epoch_no])) {
                    epochList[historyList[x].epoch_no] = []
                }
                //Check if the pool has built a block in this epoch
                if (historyList[x].block_cnt != null) {
                    if (historyList[x].block_cnt != 0) {
                        //If it has, its margin will be used for the median calculation 
                        epochList[historyList[x].epoch_no].push(historyList[x].margin)
                    }
                }
            }
        }

        return epochList;


    } catch (apiErr) {

        throw new Error('Failed to recieve pool list data from KOIOS.', apiErr.message)

    }
}

/**
 * Fetches the pool history of the pool saved in .env. The pool history contains all epochs so they get ordered by epoch in a new array.
 * @returns poolHistoryOrderedByEpoch - an array of all pool histories 
 */
async function getPoolHistoryForENVPool() {
    let poolHistory = await getViaAxiosPaginated(`${env.API_URL}/pool_history?_pool_bech32=${env.POOL_ID}`, "epoch_no");

    //Order the data according to the epoch structure, so that the index is the epoch
    let poolHistoryOrderedByEpoch = []

    for (let x = 0; x < poolHistory.length; x++) {
        if (!Array.isArray(poolHistoryOrderedByEpoch[poolHistory[x].epoch_no])) {
            poolHistoryOrderedByEpoch[poolHistory[x].epoch_no] = poolHistory[x]
        }
    }

    return poolHistoryOrderedByEpoch;
}

/**
 * Tries to load the delegator histories for the .env pool from local storage and fetches them from KOIOS if nothing is found.
 * @param {number} currentEpoch - used for loading the histories for all epochs
 * @returns delegatorHistory - an array where for every epoch (accessed by index) the delegator history is saved
 * @throws {Error} if currentEpoch isNaN
 * @throws {Error} if currentEpoch is <= 0
 * @throws {Error} if something went wrong during fetching from KOIOS
 */
async function getDelegatorHistoryForENVPool(currentEpoch) {

    if (isNaN(currentEpoch)) {
        throw new Error("The given value for currentEpoch is not a number.")
    } else if (currentEpoch <= 0) {
        throw new Error("The given value for currentEpoch is to small.")
    }

    let delegatorHistoryList = []

    for (let i = currentEpoch; i >= 0; i--) {

        console.log("Fetching delegator history " + (currentEpoch - i) + "/" + currentEpoch)
        let currentDelegatorList = await getViaAxiosPaginated(`${env.API_URL}/pool_delegators_history?_pool_bech32=${env.POOL_ID}&_epoch_no=${i}`, "stake_address")

        //The recieved array is empty. This tells us that the pool was no longer active here.
        if (Array.isArray(currentDelegatorList) && currentDelegatorList.length === 0) {
            continue;
        }

        if (!currentDelegatorList) {
            throw new Error("The recieved delegator list was empty.")
        }

        //Initialize array
        if (!Array.isArray(delegatorHistoryList[i])) {
            delegatorHistoryList[i] = []
        }

        delegatorHistoryList[i] = currentDelegatorList
    }

    return delegatorHistoryList

}

/**
 * Fetches the tokenomic stats from KOIOS for all epochs. Contains data like the reserve value or the treasury amount 
 * Orders the data into an array where the epoch can be accessed by index
 * @returns {object} tokenomicStatsOrderedByEpoch - an array containing all tokenomic stats accessed by epoch as index
 */
async function getTokenomicStats() {
    let tokenomicStats = await getViaAxiosPaginated(`${env.API_URL}/totals?_`, "epoch_no");

    //Order the data according to the epoch structure, so that the index is the epoch  
    let tokenomicStatsOrderedByEpoch = []

    for (let x = 0; x < tokenomicStats.length; x++) {
        if (!Array.isArray(tokenomicStatsOrderedByEpoch[tokenomicStats[x].epoch_no])) {
            tokenomicStatsOrderedByEpoch[tokenomicStats[x].epoch_no] = tokenomicStats[x]
        }
    }

    return tokenomicStatsOrderedByEpoch;
}

/**
 * Fetches the pool owner history from KOIOS via axios.post
 * @returns {object} poolOwnerHistory - an array containing all owner changes sorted by epoch
 */
async function getPoolOwnerHistoryForENVPool() {
  let poolOwnerHistory;
  
  let data = {
    "_pool_bech32_ids":[
      `${env.POOL_ID}`
    ]
  }
  //Technically this should be paginated aswell but im not sure how this works with axios.post() yet
  poolOwnerHistory = await koiosAxios.post(`${env.API_URL}/pool_owner_history`, data)
  
  poolOwnerHistory = poolOwnerHistory.data
  
  return poolOwnerHistory;
}

/**
 * Returns the used protocol parameters for a specific epoch
 * @param {number} epoch - the epoch from which the parameters should be fetched
 * @returns {object} the parameters in an array
 * @throws {Error} if the given epoch isNaN
 * @throws {Error} if the given epoch is <= 0
 */
async function getProtocolParameters(epoch) {

    if (isNaN(epoch)){
        throw new Error ("Given epoch is NaN.")
    } else if (epoch <= 0) {
        throw new Error ("Given epoch is <= 0.")
    }

    const protocolParameters = await koiosAxios.get(`${env.API_URL}/epoch_params?_epoch_no=${epoch}`)

    return protocolParameters.data
}

/**
 * Returns the pool info for a specific pool
 * @param {string} poolId - the pool Id of the pool from which 
 * @returns {object} the pool info array
 * @throws {Error} if the given pool Id is not a string
 */
async function getPoolInfo(poolId) {
    if (typeof poolId !== "string") {
        throw new Error ("Given pool ID is not a string")
    }

    const poolInfo = await koiosAxios.get(`${env.API_URL}/pool_updates?_pool_bech32=${poolId}`)

    return poolInfo.data
}

/**
 * Returns the Genesis infos of the network
 * @returns {object} the genesis info as an array
 */
async function getGenesisInfo() {
    const genesisInfo = await koiosAxios.get(`${env.API_URL}/genesis`)
    return genesisInfo.data
}

/**
 * Returns the epoch history of a specific epoch
 * @param {number} epoch - the specific epoch 
 * @returns {object} the epoch history as an epoch
 * @throws {Error} if the given epoch isNaN
 * @throws {Error} if the given epoch is  <= 0
 */
async function getEpochHistory(epoch) {
    if (isNaN(epoch)){
        throw new Error ("Given epoch is NaN.")
    } else if (epoch <= 0) {
        throw new Error ("Given epoch is <= 0.")
    }

    const epochHistory = await koiosAxios.get(`${env.API_URL}/epoch_info?_epoch_no=${epoch}`)
    return epochHistory.data
}

module.exports = {
    getCurrentEpoch,
    getPoolList,
    getBlocksFromEpoch,
    getPoolHistoryForENVPool,
    getPoolMarginsForAllEpochs,
    getDelegatorHistoryForENVPool,
    getTokenomicStats,
    getPoolOwnerHistoryForENVPool,
    getProtocolParameters,
    getPoolInfo,
    getGenesisInfo,
    getEpochHistory
};