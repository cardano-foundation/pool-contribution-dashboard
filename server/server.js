const express = require("express");
const cors = require("cors");

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
