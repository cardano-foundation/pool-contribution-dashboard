/**
 * @file This file provides functions for the routes to call and fetch the requestet data from the globalServerData
 * @fileoverview Provides the calculator data, the reward data and the current epoch to the routes with HTTP responses
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const { getGlobalServerData } = require('../initialization/appManager');

/**
 * Collects the calculator data from globalServerData and sends it as HTTP response
 * @param {express.Request} req - request with details to HTTP request
 * @param {express.Response} res - response used for sending back to client
 * @param {express.NextFunction} next - callback function for next middleware
 */
async function fetchCalculatorData(req, res, next) {
    try {
        //Get the server data
        const data = await getGlobalServerData();

        //Build the response object
        const calculatorData = data.calculatorData
        res.status(200).json(calculatorData);
    } catch (error) {
        next(error); 
    }
}

/**
 * Collects the rewards data from globalServerData and sends it as HTTP response
 * @param {express.Request} req - request with details to HTTP request
 * @param {express.Response} res - response used for sending back to client
 * @param {express.NextFunction} next - callback function for next middleware
 */
async function fetchRewards(req, res, next) {
    try {
        const data = await getGlobalServerData();
        if (data.delegatorRewardData !== null) {
            const reward = data.delegatorRewardData
            res.status(200).json(reward) 
        } else {
            res.status(500).json({message: "Internal error. Data could not be found."})
        }
    } catch (error) {
        next(error);
    }
}

/**
 * Collects the current epoch from globalServerData and sends it as HTTP response
 * @param {express.Request} req - request with details to HTTP request
 * @param {express.Response} res - response used for sending back to client
 * @param {express.NextFunction} next - callback function for next middleware
 */
async function fetchCurrentEpoch(req, res, next) {
    try {
        const data = await getGlobalServerData();
        if (data.currentEpoch !== null) {
            res.status(200).send(data.currentEpoch + "")
        } else {
            res.status(500).json({ message: "Internal error. Data could not be found."});
        }
    } catch (error) {
        next(error);
    }
}

module.exports = {
    fetchCalculatorData,
    fetchRewards,
    fetchCurrentEpoch
};