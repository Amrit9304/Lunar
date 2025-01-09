import Command from '../../Library/Command.js';

const command = new Command('unbanchat', {
    description: "Disable bot in that particular group",
    aliases: ['chaton'],
    category: 'moderation',
    usage: 'banchat'
});

export default async function handler(m, { conn, isOwner, isAdmin, isROwner }) {
  if (!(isAdmin || isOwner)) return dfail('admin', m, conn)
  global.db.data.chats[m.chat].isBanned = false
  m.reply('✅ Bot active in this group')
}

Object.assign(handler, command.toHandlerObject());