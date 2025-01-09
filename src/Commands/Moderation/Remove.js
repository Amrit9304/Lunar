import Command from '../../Library/Command.js';

const command = new Command('remove', {
    description: "Remove users from group",
    category: 'moderation',
    usage: 'remove [tag/quote]',
    admin: true,
    group: true,
    owner: true,
    mods: true
});

export default async function handler(m, { conn }) {
    if (!m.mentionedJid[0] && !m.quoted) return m.reply(msg, m.chat)
    let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
    await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    m.reply(`🟩 *User successfully removed*`)
}

Object.assign(handler, command.toHandlerObject());