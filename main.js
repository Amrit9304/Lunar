process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import dotenv from 'dotenv';
dotenv.config();

import './config.js';
import { createRequire } from "module";
import path, { join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk'
import syntaxerror from 'syntax-error';
import { format } from 'util';
import { makeWASocket, protoType, serialize } from './src/Library/simple.js';
import { Low, JSONFile } from 'lowdb';
import pino from 'pino';
import { MongoDB } from './src/Library/mongoDB.js';
import store from './src/Library/store.js'
const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  jidNormalizedUser,
  PHONENUMBER_MCC
} = await import('@whiskeysockets/baileys')
import NodeCache from 'node-cache'
import readline from 'readline'
const { chain } = lodash
const PORT = process.env.PORT

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) }

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = process.env.PREFIX

// DATABASE
global.opts['db'] = process.env.DATABASE_URL

//MONGODB
// if (!process.env.DATABASE_URL || !/mongodb(\+srv)?:\/\//i.test(process.env.DATABASE_URL)) {
//   throw new Error('MongoDB URL is missing. Please set the DATABASE_URL environment variable.');
// }

// const dbAdapter = new MongoDB(process.env.DATABASE_URL);
// global.db = new Low(dbAdapter);

//JSON
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new CloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
      new MongoDB(opts['db']) :
      new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
);

global.DATABASE = global.db;
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!global.db.READ) {
      clearInterval(this)
      resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
    }
  }, 1 * 1000))
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {})
  }
  global.db.chain = chain(global.db.data)
}
loadDatabase()

//--SESSION
global.authFile = `sessions`;

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const msgRetryCounterMap = () => { };
const msgRetryCounterCache = new NodeCache();

const { version } = await fetchLatestBaileysVersion();

const MethodMobile = process.argv.includes("mobile");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  mobile: MethodMobile,
  browser: ["Ubuntu", "Chrome", "20.0.04"],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: true,
  generateHighQualityLinkPreview: true,
  getMessage: async key => {
    let jid = jidNormalizedUser(key.remoteJid)
    let msg = await store.loadMessage(jid, key.id)
    return msg?.message || ''
  },
  msgRetryCounterCache,
  msgRetryCounterMap,
  defaultQueryTimeoutMs: undefined,
  version,
};

global.conn = makeWASocket(connectionOptions);

conn.isInit = false;

if (!conn.authState.creds.registered) {
  let phoneNumber;

  if (!!global.pairingNumber) {
    phoneNumber = global.pairingNumber.replace(/[^0-9]/g, '');

    if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
      console.log(
        chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example: 62xxx"))
      );
      process.exit(0);
    }
  } else {
    phoneNumber = process.env.NUMBER; // Replace with your desired phone number
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    const askForPhoneNumber = () =>
      new Promise(resolve => {
        rl.question(
          chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number: `)),
          resolve
        );
      });

    (async () => {
      while (!phoneNumber) {
        phoneNumber = await askForPhoneNumber();
        phoneNumber = (phoneNumber || "").replace(/[^0-9]/g, '');

        if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
          console.log(
            chalk.bgBlack(chalk.redBright("Start with your country's WhatsApp code, Example: 62xxx"))
          );
          phoneNumber = null; // Reset to loop again
        }
      }
      rl.close();

      setTimeout(async () => {
        let code = await conn.requestPairingCode(phoneNumber);
        code = code?.match(/.{1,4}/g)?.join('-') || code;
        const pairingCode =
          chalk.bold.greenBright('Your Pairing Code:') +
          ' ' +
          chalk.bgGreenBright(chalk.black(code));
        console.log(pairingCode);
      }, 3000);
    })();
  }
}

//conn.logger.info('\nWaiting For Login\n');

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
    }, 3 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);



// /* Clear */
let stopped = false; // Initialize with a default value

function clearTmp() {
  const tmp = [join(__dirname, './tmp')];
  const filename = [];
  const allowedExtensions = [
    '.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm',
    '.mp3', '.wav', '.flac', '.ogg', '.aac', '.wma',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
    '.svg', '.ico', '.tif', '.tiff', '.opus', '.apng',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.bin'
  ];


  tmp.forEach((dirname) => {
    const files = readdirSync(dirname);
    files.forEach((file) => filename.push(join(dirname, file)));
  });

  return filename.map((file) => {
    const stats = statSync(file);
    const extension = file.slice(file.lastIndexOf('.'));

    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 10) && allowedExtensions.includes(extension)) {
      try {
        unlinkSync(file);
        return true; // File was deleted
      } catch (error) {
        console.error(`Error deleting ${file}: ${error}`);
        return false; // File could not be deleted
      }
    }

    return false; // File doesn't meet conditions
  });
}

const interval = setInterval(() => {
  if (stopped === 'close') {
    clearInterval(interval); // Stop the interval
    return;
  }

  try {
    const deletedFiles = clearTmp();
    //console.log(chalk.cyanBright(`Auto clear Temp folder cleared. Deleted ${deletedFiles.filter(Boolean).length} files.`));
  } catch (error) {
    console.error(`Auto clear Temp folder error: ${error}`);
  }
}, 30 * 1000);

function purgeSession() {
  let prekey = [];
  const directorio = readdirSync('./sessions');
  const filesFolderPreKeys = directorio.filter((file) => {
    return file.startsWith('pre-key-');
  });
  prekey = [...prekey, ...filesFolderPreKeys];
  filesFolderPreKeys.forEach((files) => {
    unlinkSync(`./sessions/${files}`);
  });
}


function purgeOldFiles() {
  const directories = ['./sessions/'];
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  directories.forEach((dir) => {
    readdirSync(dir, (err, files) => {
      if (err) throw err;
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        stat(filePath, (err, stats) => {
          if (err) throw err;
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath, (err) => {
              if (err) throw err;
              console.log(`File ${file} deleted successfully`);
            });
          } else {
            console.log(`File ${file} not deleted`);
          }
        });
      });
    });
  });
}

async function connectionUpdate(update) {
  const { connection, lastDisconnect, isNewLogin } = update;
  global.stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    console.log(await global.reloadHandler(true).catch(console.error));
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined) {
    console.log(chalk.bold.green('\n\nEnter this OTP code, it expires in 60 seconds'));
  }
  if (connection == 'open') {
    console.log(chalk.bold.green('CONNECTED CORRECTLY TO WHATSAPP'));
  }
  if (connection == 'close') {
    console.log(chalk.bold.red(`Connection closed, please delete the ${global.authFile} folder and enter a new code`));
    process.send('reset');
  }
}

process.on('uncaughtException', console.error)

let isInit = true;
let handler = await import('./handler.js')
global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('group-participants.update', conn.participantsUpdate)
    conn.ev.off('groups.update', conn.groupsUpdate)
    conn.ev.off('message.delete', conn.onDelete)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.welcome = ''
  conn.bye = ''
  conn.spromote = ''
  conn.sdemote = ''
  conn.sDesc = ''
  conn.sSubject = ''
  conn.sIcon = ''
  conn.sRevoke = ''
  conn.handler = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
  conn.onDelete = handler.deleteUpdate.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn, true)

  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update', conn.groupsUpdate)
  conn.ev.on('message.delete', conn.onDelete)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

const pluginFolder = join(__dirname, './src/Commands');
const pluginFilter = filename => /\.js$/.test(filename);
global.plugins = {};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadPlugins(folder) {
  await delay(100);
  const files = readdirSync(folder);

  for (const file of files) {
    const filePath = path.join(folder, file);
    const stats = statSync(filePath);

    if (stats.isDirectory()) {
      //console.log(chalk.yellowBright(`Scanning folder: ${path.basename(filePath)}`));
      await loadPlugins(filePath);
    } else if (pluginFilter(file)) {
      try {
        const module = await import(pathToFileURL(filePath).href);
        const pluginName = path.basename(file, '.js');
        global.plugins[pluginName] = module.default || module;
        //console.log(chalk.greenBright(`✓ ${pluginName}`));
      } catch (e) {
        const pluginName = path.basename(file, '.js');
        console.log(chalk.red(`✘ ${pluginName}: ${e.message}`));
      }
    }
  }
}

async function filesInit() {
  await loadPlugins(pluginFolder);
  console.log("All plugins loaded successfully.");
}

let debounceTimeout;

global.reload = async (_eventType, filename) => {
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    const fullPath = join(pluginFolder, filename);
    const pluginName = path.basename(filename, '.js');

    if (!pluginFilter(filename)) return;

    if (!existsSync(fullPath)) {
      if (global.plugins[pluginName]) {
        delete global.plugins[pluginName];
        conn.logger.warn(`🗑️ Plugin Deleted - '${pluginName}'`);
      }
      return;
    }

    let err = syntaxerror(readFileSync(fullPath), pluginName, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true
    });

    if (err) {
      conn.logger.error(`Syntax error while loading '${pluginName}'\n${format(err)}`);
    } else {
      try {
        const module = await import(`${pathToFileURL(fullPath).href}?update=${Date.now()}`);
        const isNewPlugin = !(pluginName in global.plugins);

        global.plugins[pluginName] = module.default || module;

        if (isNewPlugin) {
          conn.logger.info(chalk.yellow(`✨ New plugin - '${pluginName}'`));
        } else {
          conn.logger.info(`🌟 Plugin Reloaded - '${pluginName}'`);
        }
      } catch (e) {
        conn.logger.error(`Error requiring plugin '${pluginName}':\n${format(e)}`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  });
};

Object.freeze(global.reload);

// Function to wait for WhatsApp connection
async function waitForWhatsAppConnection() {
  console.log(chalk.yellow("Checking WhatsApp connection..."));
  while (!conn.authState || !conn.authState.creds || !conn.authState.creds.registered) {
    console.log(chalk.yellowBright("Waiting for connection to WhatsApp..."));
    await delay(60000); // Retry every 3 seconds
  }
  console.log(chalk.greenBright("Connected to WhatsApp. Initializing plugins..."));
  await filesInit(); // Start plugin initialization once connected
  watch(pluginFolder, { recursive: true }, global.reload); // Start watching for changes
}

// Initialize connection and plugin loading
waitForWhatsAppConnection()
  .catch(error => {
    console.error(chalk.red("Failed to initialize the bot:"), error);
  });
await global.reloadHandler();


// Quick Test
async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127)
        })
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false))
      })
    ])
  }))
  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
  console.log(test)
  let s = global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  }
  // require('./src/Library/sticker').support = s
  Object.freeze(global.support)

  if (!s.ffmpeg) conn.logger.warn('Please install ffmpeg for sending videos (pkg install ffmpeg)')
  if (s.ffmpeg && !s.ffmpegWebp) conn.logger.warn('Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)')
  if (!s.convert && !s.magick && !s.gm) conn.logger.warn('Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)')
}

setInterval(async () => {
  purgeSession();
  console.log(chalk.cyanBright(`Session Files deleted`));
}, 1000 * 60 * 60);


setInterval(async () => {
  purgeOldFiles();
  console.log(chalk.cyanBright(`Old Files Deleted`));
}, 1000 * 60 * 60);

_quickTest()
  //.then(() => conn.logger.info('Quick test done ✅ '))
  .catch(console.error)
