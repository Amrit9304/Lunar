import Command from '../../Library/Command.js';

const command = new Command('afk', {
    description: 'Set your AFK status',
    category: 'core',
    usage: 'afk [reason]'
});

export default async function handler(m, { text, conn }) {
    let user = global.db.data.users[m.sender]
    user.afk = + new Date
    user.afkReason = text
    m.reply(`🎎 *Your afk status has been set: True*`)
}

Object.assign(handler, command.toHandlerObject());
