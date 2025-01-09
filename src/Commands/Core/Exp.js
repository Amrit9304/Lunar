import Command from '../../Library/Command.js'

const command = new Command('exp', {
    description: "Displays User's Exp ⭐",
    aliases: ['xp'],
    category: 'core',
    usage: 'exp @tag'
});

export default async function handler(m, { conn }) {
  const who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`;
  let { exp } = global.db.data.users[who]
  m.reply(`${exp}`)
}

Object.assign(handler, command.toHandlerObject());