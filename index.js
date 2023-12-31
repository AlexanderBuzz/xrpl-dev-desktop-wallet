const { app, BrowserWindow, ipcMain } = require('electron')

const fs = require("fs");
const path = require('path')
const xrpl = require("xrpl")
const { initialize, subscribe, saveSaltedSeed, loadSaltedSeed } = require('./library/5_helpers')
const { sendXrp } = require('./library/7_helpers')
const { verify } = require('./library/8_helpers')

const TESTNET_URL = "wss://s.altnet.rippletest.net:51233"

const WALLET_DIR = 'Wallet'

const createWindow = () => {

  // Creates the application window
  const appWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'view', 'preload.js'),
    },
  })

  // Loads a layout
  appWindow.loadFile(path.join(__dirname, 'view', 'template.html'))

  return appWindow
}

/**
 * This function creates a XRPL client, subscribes to 'ledger' events from the XRPL and broadcasts those by
 * dispatching the 'update-ledger-data' event which will be picked up by the frontend
 *
 * @returns {Promise<void>}
 */
const main = async () => {
  const appWindow = createWindow()

  // Create Wallet directory in case it does not exist yet
  if (!fs.existsSync(WALLET_DIR)) {
    fs.mkdirSync(path.join(__dirname, WALLET_DIR));
  }

  let seed = null;

  ipcMain.on('seed-entered', async (event, providedSeed) => {
    seed = providedSeed
    appWindow.webContents.send('open-password-dialog')
  })

  ipcMain.on('password-entered', async (event, password) => {
    if (!fs.existsSync(path.join(__dirname, WALLET_DIR , 'seed.txt'))) {
      saveSaltedSeed('../' + WALLET_DIR, seed, password)
    } else {
      seed = loadSaltedSeed('../' + WALLET_DIR, password)
    }

    const wallet = xrpl.Wallet.fromSeed(seed)

    const client = new xrpl.Client(TESTNET_URL)

    await client.connect()

    await subscribe(client, wallet, appWindow)

    await initialize(client, wallet, appWindow)

    ipcMain.on('send-xrp-action', (event, paymentData) => {
      sendXrp(paymentData, client, wallet).then((result) => {
        appWindow.webContents.send('send-xrp-transaction-finish', result)
      })
    })

    ipcMain.on('destination-account-change', (event, destinationAccount) => {
      verify(destinationAccount, client).then((result) => {
        appWindow.webContents.send('update-domain-verification-data', result)
      })
    })

  })

  // We have to wait for the application frontend to be ready, otherwise
  // we might run into a race condition and the open-dialog events
  // get triggered before the callbacks are attached
  appWindow.once('ready-to-show', () => {
    // If there is no seed present yet, ask for it, otherwise query for the password
    // for the seed that has been saved
    if (!fs.existsSync(path.join(__dirname, WALLET_DIR, 'seed.txt'))) {
      appWindow.webContents.send('open-seed-dialog')
    } else {
      appWindow.webContents.send('open-password-dialog')
    }
  })
}

app.whenReady().then(main)
