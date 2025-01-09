import Command from '../../Library/Command.js';

const command = new Command('tagall', {
    description: "Tags everyone in group",
    aliases: ['all', 'everyone'],
    category: 'moderation',
    usage: 'tagall <message>',
    admin: true,
    group: true
});

export default async function handler(m, { conn, text, participants, isAdmin, isOwner, groupMetadata }) {
    const args = text
    const groupMembers = participants.map(u => u.id).filter(jid => jid !== conn.user.jid)
    const groupAdmins = groupMetadata?.participants.filter(u => u.admin).map(u => u.id) || []
    const admins = groupMembers.filter(jid => groupAdmins.includes(jid))
    const members = groupMembers.filter(jid => !groupAdmins.includes(jid))

    const message = `${args !== '' ? `🛒 *Message:* ${args}\n\n` : ''}🎡 *Group:* ${groupMetadata.subject}\n👥 *Members:* ${
        participants.length
    }\n📣 *Tagger: @${m.sender.split('@')[0]}*\n\n` +
        admins.map(v => '🌟 @' + v.split('@')[0]).join('\n') +
        (admins.length && members.length ? '\n\n' : '') +
        members.map(v => '👤 @' + v.split('@')[0]).join('\n')

    conn.reply(m.chat, message, null, { mentions: groupMembers })
}

Object.assign(handler, command.toHandlerObject());