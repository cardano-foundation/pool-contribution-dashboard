/**
 * @file This file contains the express app and some routing
 * @fileoverview This file initializes some middlewares, the routes and error handling 
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const express = require('express');
const cors = require('cors');

const dataRoutes = require('./routes/dataRoutes');

const app = express();

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} von IP: ${req.ip}`);
    next();
});

app.use(cors());
app.use(express.json());

app.use('/api', dataRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the KOIOS to Cardano Dashboard API!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'An unknown error occured',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

module.exports = app;