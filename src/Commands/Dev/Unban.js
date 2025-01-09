import Command from '../../Library/Command.js';

const command = new Command('unban', {
    description: "Unban user",
    aliases: [],
    category: 'dev',
    usage: 'unban [tag/quote users]',
    owner: true
});

export default async function handler(m, { conn, args, usedPrefix, command }) {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat
    let user = global.db.data.users[who]
    if (!who) throw `🟨 *Tag or mention someone*`

    if (!user?.banned) {
        return conn.reply(m.chat, `*@${who.split`@`[0]} is not banned.*`, m, { mentions: [who] })
    }

    global.db.data.users[who].banned = false
    
    conn.reply(m.chat, `*@${who.split`@`[0]} is now unbanned.*`, m, { mentions: [who] })
}

handler.rowner = true
handler.mods = true

Object.assign(handler, command.toHandlerObject());