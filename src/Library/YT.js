import fetch from 'node-fetch';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';

const streamPipeline = promisify(pipeline);

export async function searchAndDownloadMusic(query) {
    try {
        const apiUrl = `https://widipe.com/download/ytdl?url=${encodeURIComponent(query)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || !data.result.mp3) {
            throw new Error('Failed to fetch MP3 download link from widipe.com');
        }

        const mp3Url = data.result.mp3;
        const videoID = extractVideoID(query);
        const thumbnailUrl = `https://i3.ytimg.com/vi/${videoID}/maxresdefault.jpg`;

        return {
            url: mp3Url,
            thumbnailUrl: thumbnailUrl
        };
    } catch (error) {
        console.error('Error searching and downloading music:', error);
        throw new Error('Failed to search and download music');
    }
}

export async function playYouTubeLink(m, conn, link) {
    try {
        const apiUrl = `https://widipe.com/download/ytdl?url=${encodeURIComponent(link)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || !data.result.mp3) {
            throw new Error('Failed to fetch MP3 download link from widipe.com');
        }

        const mp3Url = data.result.mp3;
        const videoID = extractVideoID(link);
        const thumbnailUrl = `https://i3.ytimg.com/vi/${videoID}/maxresdefault.jpg`;

        const tmpDir = os.tmpdir();
        const fileName = generateRandomName();
        const filePath = `${tmpDir}/${fileName}.mp3`;

        const mp3Stream = await fetch(mp3Url);
        if (!mp3Stream.ok) {
            throw new Error(`Failed to fetch MP3 from ${mp3Url}`);
        }

        const writableStream = fs.createWriteStream(filePath);
        await streamPipeline(mp3Stream.body, writableStream);

        const doc = {
            audio: {
                url: filePath
            },
            mimetype: 'audio/mpeg',
            ptt: false,
            waveform: [100, 0, 100, 0, 100, 0, 100],
            fileName: fileName,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: "YouTube Audio",
                    body: "↺ |◁   II   ▷|   ♡",
                    thumbnailUrl: thumbnailUrl,
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

function extractVideoID(link) {
    let videoID = '';
    if (link.includes('youtube.com')) {
        videoID = new URL(link).searchParams.get('v');
    } else if (link.includes('youtu.be')) {
        videoID = link.split('/').pop();
    }
    return videoID;
}

function generateRandomName() {
    const adjectives = ["happy", "sad", "funny", "brave", "clever", "kind", "silly", "wise", "gentle", "bold"];
    const nouns = ["cat", "dog", "bird", "tree", "river", "mountain", "sun", "moon", "star", "cloud"];

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${randomAdjective}-${randomNoun}`;
}


// import ytdl from 'ytdl-core'
// import { validateURL, getInfo } from 'ytdl-core'
// import { createWriteStream, readFile } from 'fs-extra'
// import { tmpdir } from 'os'
// import axios from 'axios'
// import { randomBytes } from 'crypto'

// // Generating a random file name
// const generateRandomFilename = (length) =>
//     randomBytes(Math.ceil(length / 2))
//         .toString('hex')
//         .slice(0, length)

// //Downloading the video or audio file and returning it as a buffer
// const getBuffer = (url, type) => {
//     const filename = `${tmpdir()}/${generateRandomFilename(12)}.${type === 'audio' ? 'mp3' : 'mp4'}` // generate a random file name
//     const stream = createWriteStream(filename)
//     ytdl(
//         url,
//         { filter: type === 'audio' ? 'audioonly' : 'videoandaudio' },
//         { quality: type === 'audio' ? 'highestaudio' : 'highest' }
//     ).pipe(stream) // Download the video or audio and pipe it to the write stream
//     return new Promise((resolve, reject) => {
//         stream.on('finish', () => {
//             readFile(filename).then(resolve).catch(reject)
//         })
//         stream.on('error', reject) // if there is an error with the write stream, reject the promise with the error
//     })
// }

// // parsing the video ID from a YouTube video URL
// const parseId = (url) => {
//     const split = url.split('/')
//     if (url.includes('youtu.be')) return split[split.length - 1]
//     return url.split('=')[1]
// }

// export default {
//     validateURL,
//     getInfo,
//     getBuffer,
//     parseId
// }