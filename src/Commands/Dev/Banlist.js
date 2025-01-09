import Command from '../../Library/Command.js';

const command = new Command('banlist', {
    description: 'Shows all ban user list',
    aliases: ['listban'],
    category: 'dev',
    usage: 'banlist'
});

export default async function handler(m, { conn }) {
    let users = Object.entries(global.db.data.users).filter(user => user[1].banned)
    conn.reply(m.chat, `
*BAN LIST*

=> Total : *${users.length}* 
${users ? '\n' + users.map(([jid], i) => `
${i + 1}. ${conn.getName(jid) == undefined ? '' : conn.getName(jid)}
`.trim()).join('\n') : ''}
`.trim())
}

Object.assign(handler, command.toHandlerObject());
