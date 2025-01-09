import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv';
dotenv.config();

//
global.name = process.env.NAME || ''
global.number = process.env.NUMBER || ''
global.mods = (process.env.MODS || '').split(','),

global.owner = [
  ['918709022955', 'PxLL', true],
  ['919137588392', 'Ash', true]
]
//['919137588392', 'Ash', true],
//['919903774615', 'Mr_jeet', true],
//['2349164049724', 'Senku TV', true],

global.prems = []
global.APIs = { // API Prefix
  // name: 'https://website'
  xteam: 'https://api.xteam.xyz', 
  nrtm: 'https://fg-nrtm.ddns.net',
  bg: 'http://bochil.ddns.net',
  fgmods: 'https://api-fgmods.ddns.net'
}
global.APIKeys = { // APIKey Here
  // 'https://website': 'apikey'
  'https://api.xteam.xyz': 'd90a9e986e18778b',
  'https://zenzapis.xyz': '675e34de8a', 
  'https://api-fgmods.ddns.net': 'TU-APIKEY' //Regístrese en https://api-fgmods.ddns.net/
}

global.cards = [
  '120363048648853734@g.us',
  '120363144314727284@g.us',
  '120363181774801103@g.us',
  '120363037891714023@g.us',
  '120363215270774133@g.us',
  '120363116909574205@g.us',
];

// Sticker WM
global.packname = '֍ ' + process.env.NAME + ' ֍';
global.author = 'BOT' 
global.fgig = 'Instagram\nhttps://www.instagram.com/fg98_ff\n'
global.dygp = 'https://chat.whatsapp.com/IO9jmpI72ejHiN4unRZleU'
global.fgsc = 'https://github.com/FG98F/dylux-fg' 
global.fgyt = 'https://youtube.com/fg98f'
global.fgpyp = 'https://paypal.me/fg98f'
global.fglog = 'https://i.imgur.com/Owmb93c.png' 

global.wait = '*⌛ _Processings..._*\n*▰▰▰▱▱▱▱▱*'
global.rwait = '⌛'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 

global.multiplier = 1000
global.maxwarn = '3'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
