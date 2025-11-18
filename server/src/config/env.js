/**
 * @file This file loads and validates the data from .env
 * @fileoverview This file checks .env variables on specific conditions and makes them globally accessable via export
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const env = {};

/**
 * Checks if the given data from .env is set correctly.
 */
function validateAndSetEnv() {

    if (!process.env.IP || process.env.IP.trim() === '') {
        throw new Error('No IP set in .env')
    }

    if (!process.env.POOL_ID || process.env.POOL_ID.trim() === '') {
        throw new Error('No Pool set in .env')
    }

    if (!process.env.MODE || (process.env.MODE !== 'CUSTOM_MARGIN' && process.env.MODE !== 'MEDIAN_MARGIN' && process.env.MODE !== 'PERCENTAGE')) {
        throw new Error('The Used MODE is either empty or not set correctly. Please check the .env file.')
    }

    if (isNaN(Number(process.env.CUSTOM_MARGIN)) || Number(process.env.CUSTOM_MARGIN) < 0 || Number(process.env.CUSTOM_MARGIN) > 1) {
        throw new Error('CUSTOM_MARGIN must be a number between 0 and 1.');
    }

    if (!process.env.API_URL || process.env.API_URL.trim() === '') {
        throw new Error('No IP set in .env')
    }

    if (process.env.MODE === 'CUSTOM_MARGIN') {
        const customMarginValue = Number(process.env.CUSTOM_MARGIN);
        if (isNaN(customMarginValue) || customMarginValue < 0 || customMarginValue > 1) {
            throw new Error('CUSTOM_MARGIN must be a number between 0 and 1 when MODE is CUSTOM_MARGIN.');
        }
        env.CUSTOM_MARGIN = customMarginValue;
    } else {
        env.CUSTOM_MARGIN = undefined;
    }

    env.IP = process.env.IP;
    env.KOIOS_TOKEN = process.env.KOIOS_TOKEN;
    env.POOL_ID = process.env.POOL_ID;
    env.MODE = process.env.MODE;
    env.API_URL = process.env.API_URL;
    env.PORT = parseInt(process.env.PORT || '5000', 10);

    console.log('.env was validated and loaded.');

}

try {
    validateAndSetEnv();
} catch (error) {
    console.error(".env validation error:", error.message);
    process.exit(1);
}

module.exports = {
    env
};
