/**
 * @file This file connects the routes to the according function
 * @fileoverview Connects the routes /get-calculator-data, /fetch-rewards and /get-current-epoch to the function from dataController.js
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

router.get('/get-calculator-data', dataController.fetchCalculatorData);
router.get('/fetch-rewards', dataController.fetchRewards);
router.get('/get-current-epoch', dataController.fetchCurrentEpoch)

module.exports = router;