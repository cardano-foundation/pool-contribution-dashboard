const express = require("express");
const axios = require('axios');
const cors = require("cors");
const fs = require('fs');
const path = require('path');

const httpProxyMiddleware = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 5000;

const dotenv = require("dotenv");
dotenv.config();

app.use(cors());
app.use(express.json());

//Forwards api requests to koios and sets the http-bearer token in the header
const proxyMiddleware = httpProxyMiddleware.createProxyMiddleware({
  target: 'https://api.koios.rest/api',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req, res) => {
      console.log("Request!", req.originalUrl);
      //Uses the KOIOS_TOKEN from .env
      proxyReq.setHeader("Authorization", `Bearer ${process.env.KOIOS_TOKEN}`);
      proxyReq.setHeader("Content-Type", 'application/json');

      //If the request contains data in its body the data gets written in the request
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  },
  logger: console,
});

app.use('/api', proxyMiddleware);

//Used to load stake data from local storage
app.get('/local-delegator-stake/:epochNo', async (req, res) => {
  //Upper margin is still hard coded!
  console.log("Got request with: " + req.params.epochNo);
  console.log(req.params.epochNo + " vs. " + process.env.LOWEST_EPOCH + " vs. " + "555");
  if (req.params.epochNo >= process.env.LOWEST_EPOCH && req.params.epochNo <= 555) {
    let dir = path.join(__dirname, 'stake_data', `epoch_${req.params.epochNo}.json`);
    const fileContent = await fs.promises.readFile(dir, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
    });
    const data = JSON.parse(fileContent);
    res.send(data);
    console.log("Epoch " + req.params.epochNo + " sent.");
  } else {
    res.send([]);
    console.log("Epoch " + req.params.epochNo + " is not in bounds.");
  }
});

app.get('/local-pool-history/:epochNo', async (req, res) => {
  if (req.params.epochNo >= process.env.LOWEST_EPOCH && req.params.epochNo <= 555) {
    let dir = path.join(__dirname, 'pool_history_data', `epoch_${req.params.epochNo}.json`);
    const fileContent = await fs.promises.readFile(dir, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
    });
    const data = JSON.parse(fileContent);
    res.send(data);
    console.log("Epoch " + req.params.epochNo + " sent.");
  } else {
    res.send([]);
    console.log("Epoch " + req.params.epochNo + " is not in bounds.");
  }
})

//Allows the express server to fetch data from koios and saves it in local storage to minimize api calls
//This is not yet final since anyone can just downlaod stuff to the server
app.get('/fetch-delegator-stake/:epochNo', async (req, res) => {
  const { epochNo } = req.params;
  const response = await axios.get(`http://localhost:${PORT}/api/v1/pool_delegators_history?_pool_bech32=${process.env.POOL}&_epoch_no=${epochNo}`);
  if (response.data) {
    saveToJSON(response.data, epochNo, 'stake_data');
    //res.json({ message: `Epoch ${i} gespeichert.` });
  } else {
    res.status(500).json({ error: 'Fehler beim Abrufen der Daten.' });
  }
});

//Allows to download a specific epochs pool history
app.get('/fetch-pool-history/:epochNo', async (req, res) => {
  const { epochNo } = req.params;
  const response = await axios.get(`http://localhost:${PORT}/api/v1/pool_history?_pool_bech32=${process.env.POOL}&_epoch_no=${epochNo}`);
  if (response.data) {
    saveToJSON(response.data, epochNo, 'pool_history_data');
    //res.json({ message: `Epoch ${i} gespeichert.` });
  } else {
    res.status(500).json({ error: 'Fehler beim Abrufen der Daten.' });
  }
})

//Allows to download all epochs at once
app.get('/download-all', async (req, res) => {
  for (let i = process.env.LOWEST_EPOCH; i <= 555; i++){
    let data = axios.get(`http://localhost:${PORT}/fetch-delegator-stake/${i}`);
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//Lets the server save the KOIOS data locally as JSON
function saveToJSON(data, epochNo, folder) {
  let dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filename = `epoch_${epochNo}.json`;
  dir = path.join(dir, filename);
  fs.writeFileSync(dir, JSON.stringify(data, null, 2));
  console.log(`Epoch ${epochNo} gespeichert als ${filename}`);
}
