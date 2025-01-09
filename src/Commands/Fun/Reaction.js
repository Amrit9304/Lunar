import fetch from 'node-fetch';
import { getBuffer, gifToMp4 } from '../../Library/function.js';
import Command from '../../Library/Command.js';

const reactions = [
    'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug',
    'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom',
    'bite', 'glomp', 'slap', 'kill', 'happy', 'wink', 'poke', 'dance', 'cringe'
];

const command = new Command('reactions', {
        description: `Send reaction to user`,
        aliases: ['reaction', ...reactions],
        category: 'fun',
        usage: `#bonk @tag`,
        group: true
    }
);

export default async function handler(m, { conn, usedPrefix, command }) {
    if (['reaction', 'reactions'].includes(command.toLowerCase())) {
        const list = `💫 ${reactions.join('\n💫 ')}`
        return conn.reply(m.chat, `Available reactions:\n\n${list}`, m)
    }

    let who;
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
    } else {
        who = m.chat;
    }

    if (!who) throw `✳️ Tag or mention someone\n\n📌 Example : ${usedPrefix}${command} @tag`;

    let apiUrl = `https://api.waifu.pics/sfw/${command}`;
    let response = await fetch(apiUrl);
    if (!response.ok) throw await response.text();

    let { url } = await response.json();
    const gifBuffer = await getBuffer(url);
    const gifToVideoBuffer = await gifToMp4(gifBuffer);

    const senderTag = `@${m.sender.split('@')[0]}`;
    const whoTag = `@${who.split('@')[0]}`;

    conn.sendMessage(
        m.chat,
        { 
            video: gifToVideoBuffer, 
            caption: `*${m.sender === who ? senderTag + ` ${command}ed themselves` : `${senderTag} ${command}ed ${whoTag}` }*`,
            gifPlayback: true,
            mentions: [m.sender, who]
        },
        {
            quoted: m
        }
    );
}

Object.assign(handler, command.toHandlerObject());
