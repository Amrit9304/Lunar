import Command from '../../Library/Command.js';

const checks = ['awesomecheck', 'greatcheck', 'gaycheck', 'cutecheck', 'lesbiancheck', 'hornycheck', 'prettycheck', 'lovelycheck', 'uglycheck', 'beautifulcheck', 'handsomecheck'];

const command = new Command('checkuser', {
    description: 'Set your AFK status',
    aliases: ['cu', ...checks],
    category: 'fun',
    usage: 'checkuser [mention user | quote user]',
    group: true
});

export default async function handler(m, { conn, command }) {
    let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let percentage = Math.floor(Math.random() * 100) + 1;

    let response;
    if (checks.includes(command)) {
        let checkName = command.toUpperCase().replace('CHECK', 'CHECK');
        response = `🎆 *${checkName}* 🎆\n\n @${target.split('@')[0]} is ${percentage}% ${command.replace('check', '')}`;
    } else {
        response = `Available checks: \n\n• ${checks.join('\n• ')}`;
    }

    conn.reply(m.chat, response, m, { mentions: [target] });
};

Object.assign(handler, command.toHandlerObject());
