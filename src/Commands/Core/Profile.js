import { canLevelUp, xpRange } from '../../Library/levelling.js'
import Command from '../../Library/Command.js'

const command = new Command('profile', {
    description: "Displays user's profile",
    aliases: ['p'],
    category: 'core',
    usage: 'profile [tag/quote user]'
});

export default async function handler(m, { conn, usedPrefix, command}) {

let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`
let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png')
let user = global.db.data.users[who]
let about = (await conn.fetchStatus(who).catch(console.error) || {}).status || ''
let { name, exp, credit, registered, regTime, age, role, warn } = global.db.data.users[who]
//let { min, xp, max } = xpRange(user.level, global.multiplier)
let username = user.name2 ? user.name2 : user.name;
// let level = user.level2 ? user.level2 : user.level;
//let math = max - xp 
let prem = global.prems.includes(who.split`@`[0])

let level = user.level;
let { min, xp, max } = xpRange(user.level);
let progress = user.exp - min; // Progress relative to the current level range
let math = max - user.exp; // XP needed to level up
console.log(min)
console.log(max)
console.log(xp)
m.reply(`LEVEL- ${level}\n\n*⬆️ XP* : Total ${exp} (${progress} / ${xp})\n${math <= 0 ? `Ready for *${usedPrefix}levelup*` : `*${math}xp* missing to level up`}`)

// let str = `*🪪 Name:* ${username}${about ? '\n\n 🎌 *Bio:* ' + about : ''}

// *⚠️ Warnings:* ${warn}/${maxwarn}

// *💰 Gold :* ${credit}

// *✨ Level* : ${level}

// *⬆️ XP* : Total ${exp} (${user.exp - min} / ${xp})\n${math <= 0 ? `Ready for *${usedPrefix}levelup*` : `*${math}xp* missing to level up`}

// *🏆 Rank:* ${role}

// *📇 Registered :* ${registered ? 'Yes': 'No'}

// *⭐ Premium* : ${prem ? 'Yes' : 'No'}
// `
//     conn.sendFile(m.chat, pp, 'profil.jpg', str, m, false, { mentions: [who] })
//    m.react(done)

}

Object.assign(handler, command.toHandlerObject());
