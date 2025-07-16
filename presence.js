const rpc = require("discord-rpc")
const fs = require("fs")
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const clientId = '344857022581309440';
rpc.register(clientId);

const client = new rpc.Client({ transport: 'ipc' });

let hotkeyCount = 0;
let playerCount = 0;
const startTime = new Date();

puppeteerExtra.use(StealthPlugin());

async function fetchPlayerCount() {
  try {
    const browser = await puppeteerExtra.launch({ headless: true });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
    );

    const response = await page.goto('https://servers-frontend.fivem.net/api/servers/single/5p4q9d', {
      waitUntil: 'networkidle2',
    });

    if (!response.ok()) {
      console.warn(`[fetchPlayerCount] Warning: Response not OK (status ${response.status()})`);
    }

    const responseBody = await response.text();

    let json;
    try {
      json = JSON.parse(responseBody);
    } catch (parseErr) {
      console.error('[fetchPlayerCount] Failed to parse JSON:', parseErr.message);
      await browser.close();
      return;
    }

    playerCount = json?.Data?.selfReportedClients ?? 0;
    console.log(`[fetchPlayerCount] Player count updated: ${playerCount}`);

    updateActivity();

    await browser.close();
  } catch (err) {
    console.error('[fetchPlayerCount] Failed to fetch player count with Puppeteer:', err.message);
  }
}

function updateActivity() {
  if (!client) return;

  client.setActivity({
    details: `Stay Mad Ju <3`,
    state: `Players online: ${playerCount}`,
    startTimestamp: startTime,
    largeImageKey: 'hotkey_icon',
    largeImageText: 'AHK Tracker',
    buttons: [
      {
        label: 'GitHub (Coming Soon!) ',
        url: 'https://github.com/LittleKitty3613/impulse99-AutoHokey-Script-v2'
      },
    ],
    instance: false,
  }).catch(err => console.error('Failed to set activity:', err));
}

client.on('ready', () => {
  console.log('Connected to Discord!');
  updateActivity();
  fetchPlayerCount();

  setInterval(fetchPlayerCount, 15000);

  fs.watchFile('hotkey_count.txt', () => {
    fs.readFile('hotkey_count.txt', 'utf8', (err, data) => {
      if (!err && !isNaN(parseInt(data))) {
        hotkeyCount = parseInt(data);
        updateActivity();
      }
    });
  });
});

client.on('disconnected', () => {
  console.warn('Disconnected from Discord. Make sure it\'s running.');
});

client.on('error', (err) => {
  console.error('Discord RPC error:', err);
});

client.login({ clientId }).catch(err => {
  console.error('Failed to login to Discord RPC:', err);
});
