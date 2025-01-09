import fetch from 'node-fetch';
import Command from '../../Library/Command.js';

const command = new Command('instagram', {
    description: "Download media from Instagram",
    aliases: ['ig', 'igdl', 'insta'],
    category: 'media',
    usage: 'ig <url>'
});

export default async function instagram(m, { conn, text }) {
    if (!text) throw `Please provide a valid Instagram URL.`;
    try {
        const res = await fetch(`https://btch.us.kg/download/igdl?url=${text}`);
        const data = await res.json();
        if (!data?.result?.length) throw new Error("No media found or invalid API response.");
        for (const media of data.result) {
            const filename = media.url.endsWith('.mp4') ? 'instagram.mp4' : 'instagram.jpg';
            await conn.sendFile(m.chat, media.url, filename, null, m);
        }
    } catch (error) {
        console.error("Error occurred:", error);
        throw new Error(`An error occurred: ${error.message}`);
    }
}

Object.assign(instagram, command.toHandlerObject());