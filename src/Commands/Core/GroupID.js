import Command from '../../Library/Command.js';

const command = new Command('groupid', {
    description: "Gets group id",
    aliases: [],
    category: 'misc',
    usage: 'groupid',
});

export default async function handler(m, { conn }) {
    const groupId = m.chat;

    conn.reply(m.chat, `${groupId}`, m);
}

Object.assign(handler, command.toHandlerObject());