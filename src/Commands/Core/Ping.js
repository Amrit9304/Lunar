import speed from 'performance-now';
import Command from '../../Library/Command.js'

const command = new Command('ping', {
    description: "Displays the bot's ping",
    aliases: ['speed'],
    category: 'core',
    usage: 'ping'
});

export default async function handler(m, {}) {
    let timestamp = speed();
    let latency = speed() - timestamp
    m.reply(`${latency.toFixed(4)} ms`);
}

Object.assign(handler, command.toHandlerObject());