import Command from '../../Library/Command.js';

const command = new Command('report', {
  description: 'Report an issue or problem.',
  aliases: ['bug'],
  category: 'utils',
  usage: '#report <issue>',
});

export default async function handler(m, { text, conn }) {
  const chat = '120363377676138317@g.us';
  const user = `@${m.sender.split('@')[0]}`

  if (!text) {
    return m.reply('❌ Please provide the issue to report. Usage: #report <issue>');
  }

  const reportMessage = `
📢 *New Report*
👤 ${user}
📑 *Issue:* ${text}
`.trim();

  await conn.sendMessage(
    chat,
    { text: reportMessage, mentions: [m.sender] },
    { quoted: m }
  );

  m.reply('Your report has been sent. Thank you for helping us improve!');
}

Object.assign(handler, command.toHandlerObject());
