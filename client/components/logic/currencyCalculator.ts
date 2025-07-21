/**
 * @file Allows conversion between ada and dollar
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @date 2025-07-21
 * @version 1.0.0
 * @module Client
 * @license MIT
 */

import Big from "big.js";

/**
 * Calculates a monetary value by applying an exchange rate.
 * The result is rounded to 2 decimal places using rounding half up.
 *
 * @param {string} exchangeRate - The exchange rate as a string (e.g., "1.23").
 * @param {Big} value - The base value as a Big.js object to be converted.
 * @returns {Big} The converted value as a Big.js object, rounded to 2 decimal places.
 */
export function calculateValueWithExchangeRate(exchangeRate: string, value: Big) {
    return value.times(Big(exchangeRate)).round(2, 1)
}