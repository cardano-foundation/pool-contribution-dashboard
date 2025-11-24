/**
 * @file This file creates an axios instance and makes it accessable via export
 * @fileoverview This file creates an axios instance with custom URL and header based on .env. Uses a KOIOS bearer token
 * to make things faster and to allow for 50.000 calls per day
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const axios = require('axios');
const { env } = require('./env');

let headers = {
    'Content-Type': 'application/json',
};

console.log(env.KOIOS_TOKEN);

console.log(env)

if (env.KOIOS_TOKEN) {
    headers["Authorization"] = `Bearer ${env.KOIOS_TOKEN}`;
}

console.log(headers)

/**
 * Creates an axios instance with custom URL, headers and timeout value
 */
const koiosAxios = axios.create({
    baseURL: env.API_URL,
    headers: headers,
    timeout: 30000
});

/**
 * Handles debugging in the server terminal 
 */
koiosAxios.interceptors.response.use(
    response => {
        console.log('Response from:', response.config.url);
        console.log('Response status:', response.status);
        return response;
    },
    error => {
        console.error('Axios Error:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
        return Promise.reject(error);
    }
);

module.exports = koiosAxios;
