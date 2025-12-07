/**
 * This script generates a config.json file in the public directory
 * based on environment variables defined in the .env.local file.
 * It is executed during the build process to ensure that the
 * frontend has access to the necessary configuration.
 */

const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'public', 'config.json');

const config = {
  apiURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  //Deafult: UNHCR Pool ID
  poolId: process.env.NEXT_PUBLIC_POOL_ID || 'pool1dmnyhw9uthknzcq4q6pwdc4vtfxz5zzrvd9eg432u60lzl959tw',
  localStorageKey: process.env.NEXT_PUBLIC_LOCAL_STORAGE_KEY || 'rewardData',
};

try {
  fs.writeFileSync(targetPath, JSON.stringify(config, null, 2));
  console.log(`config.js generated with URL: ${config.apiURL}`);
} catch (err) {
  console.error('Error when generating config.json:', err);
  process.exit(1);
}