import Command from '../../Library/Command.js';
import dotenv from 'dotenv';

dotenv.config();

const command = new Command('mods', {
    description: "Send the MODS list",
    aliases: ['mod'],
    category: 'core',
    usage: 'mods'
});

export default async function handler(m, { conn }) {
    let mods = (process.env.MODS || '').split(',')
    .map(v => v.trim()) // Trim whitespace from each number
    .filter(v => v) // Remove empty entries
    .map(v => v.includes('@') ? v : `${v}@s.whatsapp.net`);
    if (mods && mods.length > 0) {
        let tag = mods.map(v => '➠ @' + v.replace(/@.+/, '')).join('\n');
        conn.reply(m.chat, `MODS:\n${tag}`, m, { mentions: mods });
    } else {
        conn.reply(m.chat, 'No MODS found in the global variable.', m,);
    }
};

Object.assign(handler, command.toHandlerObject());