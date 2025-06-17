/**
 * @file This file starts the server and listens on port and ip defined in .env
 * @fileoverview This file initializes dotenv and calls a function in appManager.js that initializes and validates the data
 * that this server aims to provide as an API
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const dotenv = require("dotenv");
dotenv.config()
const app = require('./src/app');
const { startApp } = require('./src/initialization/appManager');
const { env } = require('./src/config/env');

const PORT = env.PORT;
const IP = env.IP;

//Server needs to run some fetching and calculation before it will listen on IP and PORT
startApp(app)
    .then(() => {
        app.listen(PORT, IP, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Mode: ${process.env.MODE}`);
        });
    })
    .catch(error => {
        console.error('Error while starting server:', error);
        process.exit(1);
    });

process.on('uncaughtException', err => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled promise rejection:', reason);
    process.exit(1);
});