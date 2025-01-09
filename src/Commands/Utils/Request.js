import Command from '../../Library/Command.js';

const command = new Command('request', {
  description: 'Report an issue or problem.',
  aliases: ['suggest'],
  category: 'utils',
  usage: '#reqest <message>',
});

export default async function handler(m, { text, conn }) {
  const chat = '120363377676138317@g.us';
  const user = `@${m.sender.split('@')[0]}`

  if (!text) {
    return m.reply('Please specify the feature you would like to add or remove. Usage: #request <message>');
  }

  const reportMessage = `
📢 *New Request*
👤 ${user}
📑 *Issue:* ${text}
`.trim();

  await conn.sendMessage(
    chat,
    { text: reportMessage, mentions: [m.sender] },
    { quoted: m }
  );

  m.reply('Your request has been sent');
}

Object.assign(handler, command.toHandlerObject());
