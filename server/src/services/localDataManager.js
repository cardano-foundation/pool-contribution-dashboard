/**
 * @file This file provides functions for saving and loading data from local storage
 * @fileoverview Can check if a directory exists in local storage, load data from that directory or save data to that directory
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Makes sure the folder to save in exists
 */
async function ensureDataDirExists() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        //If folder exists, the error for that gets ignored
        if (error.code !== 'EEXIST') {
            throw new Error("Error when creating the data folder. " + error.message);
        }
    }
}

/**
 * Allows saving data to local storage as JSON
 * @param {object} data - the data to save
 * @param {string} name - the name of the generated file 
 * @param {string} folder - the folder to save in
 */
async function saveToJSON(data, name, folder = '') {
    await ensureDataDirExists();
    //Use folder when given
    const targetDir = folder ? path.join(DATA_DIR, folder) : DATA_DIR;

    fs.mkdir(targetDir, { recursive: true });
    
    const filename = `${name}.json`;
    const filePath = path.join(targetDir, `${name}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`${name} saved as  ${filename}`);
}

/**
 * Allows loading data from a locally stored .json file
 * @param {string} name - the name of the file without .json
 * @param {string} folder - the name of the folder to load from
 * @returns the data found locally in JSON | null if nothing is found
 */
async function loadFromJSON(name, folder = '') {
    const filePath = path.join(DATA_DIR, folder, `${name}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log("File not found...")
            return null;
        }
        throw new Error(`Error when trying to load ${filePath}:` +  error.message);
    }
}

module.exports = {
    saveToJSON,
    loadFromJSON
};