import fetch from 'node-fetch';
import Command from '../../Library/Command.js'

const command = new Command('pickupline', {
    description: "UwU",
    aliases: [],
    category: 'fun',
    usage: 'pickupline [tag]',
    group: true
});

export default async function handler(m, { conn }) {
    try {
        let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted && m.quoted.sender ? m.quoted.sender : null;
        let res = await fetch(`https://api.popcat.xyz/pickuplines`);

        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }

        let json = await res.json();

        let error = 'Quote/Tag someone'
        let pickupLine = target ? `*@${target.split('@')[0]} ${json.pickupline}*` : error;

        conn.reply(m.chat, pickupLine, m, { mentions: target ? [target] : [] });
    } catch (error) {
        console.error(error);
    }
};

Object.assign(handler, command.toHandlerObject());