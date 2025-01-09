import Command from '../../Library/Command.js';

const command = new Command('chatid', {
});

export default async function handler(m, { conn, text, groupMetadata }) {
    console.log(m.chat)
    m.reply(m.chat)
}

Object.assign(handler, command.toHandlerObject());