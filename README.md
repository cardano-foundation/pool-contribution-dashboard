# pool-contribution-dashboard
This project aims to provide a dashboard solution to visualize the delegator contribution (donation) to a 100% margin stake pool

## 🚀 Getting Started

The repository contains two projects. The server and the client.

After cloning you need to run npm install in both directories.

Currently the dashbaord was only tested for the UNHCR Pool (pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw)

### Client

Create a .env.local file in the client directory and paste the following:

```
NEXT_PUBLIC_API_URL = "http://<Domain of the Server>:5000"
NEXT_PUBLIC_POOL_ID = "<PoolID to use>"
NEXT_PUBLIC_LOCAL_STORAGE_KEY = "rewardData"
```

Run npm run build in the client directory.
After building you can use npm start to start the app.

### Server

First you need to create a HTTP Bearer Token for https://koios.rest/.

After that create a .env file in the server directory and paste the following:

```
KOIOS_TOKEN = "<The HTTP Bearer Token>"
NODE_ENV= "development"
POOL_ID = "<PoolID to use>"
IP = "<IP or Domain to use>"
PORT = "5000"
MODE = "CUSTOM_MARGIN"              # Two modes: 1. CUSTOM_MARGIN, 2. MEDIAN_MARGIN
CUSTOM_MARGIN = "0.02"              # Must be between 0 and 1
API_URL = 'https://api.koios.rest/api/v1'
```

Run npm start in the server directory to start.
Be aware of the Fact that using the MEDIAN_MARGIN can take up to half an hour for the first data fetching from Koios.

## TODO

The Client Page Delegators is not yet implemented. 

The Server Mode PERCENTAGE is also not implemented yet as a bug was found there.

