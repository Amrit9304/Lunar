import fetch from 'node-fetch';
import Command from '../../Library/Command.js';

const command = new Command('ytvideo', {
    description: "Download media from YouTube",
    aliases: ['ytv'],
    category: 'media',
    usage: 'yt_<url>'
});

export default async function youtube(m, { conn, text }) {
    if (!text) throw `Please provide a valid Instagram URL.`;
    try {
        const res = await fetch(`https://btch.us.kg/download/ytdl?url=${encodeURIComponent(text)}`);
        const data = await res.json();

        if (!data.status) throw new Error("No media found or invalid API response.");
        const buffer = await (await fetch(data.result.mp4)).arrayBuffer();
        await conn.sendFile(m.chat, buffer, null, null, m);
        
    } catch (error) {
        console.error("Error occurred:", error);
        m.reply('An error occurred while fetching the video information.');
    }
}

Object.assign(youtube, command.toHandlerObject());