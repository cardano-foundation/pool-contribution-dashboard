/**
 * @file This file provides helper functions on the server
 * @fileoverview This file allows fetching data paginated and with duplicate check
 * @author Max Grützmacher max.gruetzmacher@cardanofoundation.org
 * @version 1.0.0
 * @since 2025-06-16
 * @license MIT
 * @module Server
 */
const koiosAxios = require('../config/axiosInstance');

/**
 * Allow fetching data the exceeds the limit of 1000 entries from KOIOS in multiple chunks.
 * Sometimes leads to duplicated data that is saved over important data (Its KOIOS fault)
 * Can check for duplicats to throw an error when that happens. Not much more I can do.
 * 
 * identifier modes:
 * - "no_check": no check is applied
 * - field name as string: the function checks if there are any duplicats of this field
 * - two field names as {string1, string2}: function checks if combination of theses fields is duplicated 
 * 
 * @param {string} url - the URL from which the data shall be fetched 
 * @param {string | object} identifier that is used to set the mode of the function
 * @returns dataList - the fetched data
 * @throws {Error} if url is empty
 * @throws {Error} if identifier is set wrong
 * @throws {Error} if checked data contains duplicats
 * @throws {Error} if something goes wrong during fetching from KOIOS
 */
async function getViaAxiosPaginated(url, identifier) {

    console.log("Using pagination...")

    if (!url || url === "") {
        throw new Error('Given url is empty or not definde correctly.')
    }

    try {
        let recieving = true;
        let dataList = []
        const limit = 1000;
        let offset = 0;

        while (recieving) {
            let page = await koiosAxios.get(url + `&offset=${offset}&limit=${limit}`)


            const chunk = page.data;
            console.log("Chunk length: " + chunk.length)

            if (chunk.length < limit) {
                recieving = false;
            }
            offset += chunk.length

            dataList.push(...chunk);


        }

        if (identifier !== "no_check") {

            let ids = []

            if (typeof identifier === "object") {
                ids = dataList.map(obj => `${obj[identifier[0]]}-${obj[identifier[1]]}`);
            } else if (typeof identifier === "string") {
                console.log(identifier)
                ids = dataList.map(obj => obj[identifier]);
            } else {
                throw new Error("Identifier for checking duplicats when paginating is set wrong.")
            }

            const uniqueIds = new Set(ids);
            const same = ids.length === uniqueIds.size;

            console.log("Contains duplicats? " + !same)

            if (!same) {
                console.log(ids.length)
                console.log(uniqueIds.size)
                throw new Error("Fetched data contains " + (ids.length - uniqueIds.size) + " duplicats. This is a huge problem on KOIOS side. Please use mode CUSTOM_MARGIN.")
            }

        }

        return dataList;

    } catch (paginatedError) {
        throw new Error('Error occured during paginated fetching of data: ' + paginatedError.message)
    }
}

module.exports = { getViaAxiosPaginated }