import Command from '../../Library/Command.js';

const command = new Command('banchat', {
    description: "Disable bot in that particular group",
    aliases: ['chatoff'],
    category: 'moderation',
    usage: 'banchat'
});

export default async function handler(m, { conn, isOwner, isAdmin }) {
  if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
  global.db.data.chats[m.chat].isBanned = true
  m.reply('🟥 *The bot is deactivated in this group*')
}

Object.assign(handler, command.toHandlerObject());