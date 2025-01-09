import Command from '../../Library/Command.js';

const command = new Command('retrieve', {
  description: "Retrieves view once message",
  aliases: ['rvo'],
  category: 'utils',
  usage: 'retrieve [quote view once message]'
});

export default async function handler(m, { conn }) {
  if (!/viewOnce/.test(m.quoted?.mtype)) throw '🟥 *Its Not a ViewOnce Message*'
  let mtype = Object.keys(m.quoted.message)[0]
  let buffer = await m.quoted.download()
  let caption = m.quoted.message[mtype].caption || ''
  conn.sendMessage(m.chat, { [mtype.replace(/Message/, '')]: buffer, caption }, { quoted: m })
}

Object.assign(handler, command.toHandlerObject());