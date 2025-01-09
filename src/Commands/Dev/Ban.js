import Command from '../../Library/Command.js';

const command = new Command('ban', {
    description: 'Bans the tagged or quoted user',
    aliases: [],
    category: 'dev',
    usage: 'ban [tag/quote users]',
    owner: true
});

export default async function handler(m, { conn, text, groupMetadata }) {
    const who = m.isGroup ? (m.mentionedJid[0] || (m.quoted ? m.quoted.sender : false)) : m.chat;
    const user = global.db.data.users[who];

    if (!text) return conn.reply(m.chat, `Provide a reason to ban the user`)

    if (!who) throw `🟨 *Tag or mention someone*`
    if (user?.banned) {
        conn.reply(m.chat, `*@${who.split`@`[0]} is already banned from using the bot.*`, m, { mentions: [who] })
        return
    }
    const sender = m.fromMe ? conn.user.jid : m.sender
    const username = conn.getName(sender)
    global.db.data.users[who].banned = {
        bannedBy: username,
        bannedIn: groupMetadata.subject,
        banTime: new Date().toUTCString(),
        banReason: reason
    }
    
    conn.reply(m.chat, `*@${who.split`@`[0]} you are now banned from using the bot.*\n\n*Reason:* ${text}`, m, { mentions: [who] })
}

Object.assign(handler, command.toHandlerObject());