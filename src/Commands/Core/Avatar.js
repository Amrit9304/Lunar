import Command from '../../Library/Command.js';

const command = new Command('avatar', {
    description: "Fetches user avatar",
    aliases: [],
    category: 'core',
    usage: 'avatar [tag/quote user]'
});

export default async function handler(m, { conn }) {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './assets/images/avatar_contact.png')

    conn.sendButton(m.chat, null, null, pp, [['Script', `.sc`]], null, [['Download', pp]], m)
}

Object.assign(handler, command.toHandlerObject());
