import fetch from "node-fetch";
import yts from 'youtube-yts';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';
import Command from '../../Library/Command.js';

const streamPipeline = promisify(pipeline);

const command = new Command('play', {
    description: "Plays a YouTube video or searches for audio",
    aliases: ['yta', 'ytaudio', 'ytmp3'],
    category: 'media',
    usage: 'play <YouTube link or song name>'
});

export default async function handler(m, { conn, text }) {
    conn.GURUPLAY = conn.GURUPLAY ? conn.GURUPLAY : {};
    if (!text) {
        m.reply(`*🟥 Please provide a song link or name*`);
        return;
    }

    await conn.reply(m.chat, wait, m);
    const isYouTubeLink = text.includes("youtube.com") || text.includes("youtu.be");

    if (isYouTubeLink) {
        await playYouTubeLink(m, conn, text);
    } else {
        const result = await searchAndDownloadMusic(text);
        const infoText = `✦ ──『 *${global.name} PLAYER* 』── ⚝ \n\n [ ⭐ Quote this message and reply the number of the desired search result to get the Audio]. \n\n`;
        const orderedLinks = result.allLinks.map((link, index) => `*${index + 1}.* ${link.title}`);
        const fullText = `${infoText}\n\n${orderedLinks.join("\n\n")}`;

        const { key } = await conn.reply(m.chat, fullText, m);
        conn.GURUPLAY[m.sender] = {
            result,
            key,
            timeout: setTimeout(() => {
                conn.sendMessage(m.chat, { delete: key });
                delete conn.GURUPLAY[m.sender];
            }, 150 * 1000),
        };
    }
}

handler.before = async (m, { conn }) => {
    conn.GURUPLAY = conn.GURUPLAY ? conn.GURUPLAY : {};
    if (m.isBaileys || !(m.sender in conn.GURUPLAY))return;

    const { result, key, timeout } = conn.GURUPLAY[m.sender];
    if (!m.quoted || m.quoted.id !== key.id || !m.text) return;

    const choice = m.text.trim();
    const inputNumber = Number(choice);

    if (inputNumber >= 1 && inputNumber <= result.allLinks.length) {
        const selectedUrl = result.allLinks[inputNumber - 1].url;
        await playYouTubeLink(m, conn, selectedUrl);
    } else {
        m.reply("Invalid sequence number. Please select a valid number from the list above.");
    }
};

Object.assign(handler, command.toHandlerObject());

// Helper functions
async function searchAndDownloadMusic(query) {
    try {
        const { videos } = await yts(query);
        if (!videos.length) return { error: "No video results found." };

        return {
            title: videos[0].title,
            description: videos[0].description,
            duration: videos[0].duration,
            author: videos[0].author.name,
            allLinks: videos.map(video => ({ title: video.title, url: video.url })),
            videoUrl: videos[0].url,
            thumbnail: videos[0].thumbnail,
        };
    } catch (error) {
        return { error: error.message };
    }
}

async function playYouTubeLink(m, conn, text) {
    try {
        let link = text
        console.log(link)
        const apiUrl = `https://btch.us.kg/download/ytdl?url=${encodeURIComponent(link)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || !data.result.mp3) {
            throw new Error("Failed to retrieve audio link from API");
        }

        const title = data.result.title;
        const tmbn = `https://i3.ytimg.com/vi/${data.result.id}/maxresdefault.jpg`;
        const audioUrl = data.result.mp3;
        const tmpDir = os.tmpdir();
        const fileName = generateRandomName();
        const filePath = `${tmpDir}/${fileName}.mp3`;

        const audioResponse = await fetch(audioUrl);
        const writableStream = fs.createWriteStream(filePath);
        await streamPipeline(audioResponse.body, writableStream);
        //conn.sendFile(m.chat, tmbn, 'img.jpg', null, m);

        const doc = {
            audio: {
                url: `${tmpDir}/${fileName}.mp3`
            },
            mimetype: 'audio/mpeg',
            ptt: false,
            waveform: [100, 0, 100, 0, 100, 0, 100],
            fileName: `${title}`,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "↺ |◁   II   ▷|   ♡",
                    body: `${title}`,
                    thumbnailUrl: tmbn,
                    sourceUrl: link,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        };

        await conn.sendMessage(m.chat, doc);
    } catch (error) {
        console.error("Error playing YouTube link:", error);
        m.reply("Failed to play the YouTube link. Please try again later.");
    }
}

function generateRandomName() {
    const adjectives = ["happy", "sad", "funny", "brave", "clever", "kind", "silly", "wise", "gentle", "bold"];
    const nouns = ["cat", "dog", "bird", "tree", "river", "mountain", "sun", "moon", "star", "cloud"];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}`;
}
