import Command from '../../Library/Command.js';

const command = new Command('owner', {
    description: "Sends owner contact",
    aliases: [],
    category: 'core',
    usage: 'owner'
});

export default async function handler(m, { }) {
    const data = global.owner.filter(([id, isCreator]) => id && isCreator)
    this.sendContact(m.chat, data.map(([id, name]) => [id, name]), m)
}

Object.assign(handler, command.toHandlerObject());
