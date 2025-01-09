import fs from 'fs';
import os from 'os';
import path from 'path';
import fetch from 'node-fetch';
import { Sticker } from 'wa-sticker-formatter';
import Command from '../../Library/Command.js';

const command = new Command('sticker', {
    description: "Converts image/video/gif/text to sticker",
    aliases: ['s'],
    category: 'utils',
    usage: 'sticker [caption/quote message containing media] [options] | <pack> | <author>'
});

const PACKNAME = global.packname;
const AUTHOR = global.author;

export default async function handler(m, { conn, args, text }) {
    let stickerBuffer = false;

    if (args.length === 0) {
        global.packname = PACKNAME;
        global.author = AUTHOR;
    }

    const options = args.filter(arg => arg.startsWith('--'));
    const arg = args.filter(arg => !arg.startsWith('--')).join(" ").split("|").map(part => part.trim());

    if (arg[0] && arg[0] !== "") {
        global.packname = arg[0];
        global.author = ""
    }

    if (arg.length > 1 && arg[1] && arg[1] !== "") {
        global.packname = arg[0]
        global.author = arg[1];
    }

    try {
        if (m.quoted) {
            let q = m.quoted;
            let mime = (q.msg || q).mimetype || q.mediaType || '';

            if (/webp|image|video/g.test(mime)) {
                if (/video/g.test(mime) && (q.msg || q).seconds > 11) return m.reply('Maximum video length is 10 seconds');

                let img = await q.download?.();
                if (!img) return m.reply(`Reply to an image or video with *#s*`);

                const sticker = new Sticker(img, {
                    pack: global.packname,
                    author: global.author,
                    type: getStickerType(options),
                    quality: getStickerQuality(options)
                });

                stickerBuffer = await sticker.build();
            } else if (!mime) {
                const quotedText = q.text || q.caption || '';
                if (!quotedText) throw '✳️ No text found in the quoted message.';

                const who = q.sender || m.sender;
                const userPfp = await conn.profilePictureUrl(who, 'image')
                    .catch(() => 'https://cdn.jsdelivr.net/gh/Guru322/api@Guru/guru.jpg');
                const user = global.db.data.users[who];
                const { name } = user;
                const quoteJson = {
                    type: "quote",
                    format: "png",
                    backgroundColor: "#FFFFFF",
                    width: 1800,
                    height: 200,
                    scale: 2,
                    messages: [{
                        entities: [],
                        avatar: true,
                        from: {
                            id: 1,
                            name: name,
                            photo: { url: userPfp },
                        },
                        text: quotedText,
                        replyMessage: {},
                    }],
                };

                const res = await fetch('https://bot.lyo.su/quote/generate', {
                    method: 'POST',
                    body: JSON.stringify(quoteJson),
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!res.ok) await m.reply(`Failed to fetch: ${res.status} ${res.statusText}`);
                const json = await res.json();
                if (!json.result || !json.result.image) throw new Error('Unexpected response structure');

                const bufferImage = Buffer.from(json.result.image, 'base64');
                const tempImagePath = path.join(os.tmpdir(), 'tempImage.png');
                fs.writeFileSync(tempImagePath, bufferImage);

                const sticker = new Sticker(tempImagePath, {
                    pack: global.packname,
                    author: global.author,
                    type: getStickerType(options),
                    quality: getStickerQuality(options)
                });

                stickerBuffer = await sticker.build();
                fs.unlinkSync(tempImagePath);

            } else {
                return m.reply('Invalid input type. Please send an image, video, or GIF.');
            }
        } else if (text) {
            const who = m.sender;
            const userPfp = await conn.profilePictureUrl(who, 'image')
                .catch(() => 'https://cdn.jsdelivr.net/gh/Guru322/api@Guru/guru.jpg');

            const user = global.db.data.users[who];
            const { name } = user;

            const quoteJson = {
                type: "quote",
                format: "png",
                backgroundColor: "#FFFFFF",
                width: 1800,
                height: 200,
                scale: 2,
                messages: [{
                    entities: [],
                    avatar: true,
                    from: {
                        id: 1,
                        name: name,
                        photo: { url: userPfp },
                    },
                    text: text,
                    replyMessage: {},
                }],
            };

            const res = await fetch('https://bot.lyo.su/quote/generate', {
                method: 'POST',
                body: JSON.stringify(quoteJson),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
            }

            const json = await res.json();
            if (!json.result || !json.result.image) {
                throw new Error('Unexpected response structure');
            }

            const bufferImage = Buffer.from(json.result.image, 'base64');
            const tempImagePath = path.join(os.tmpdir(), 'tempImage.png');
            fs.writeFileSync(tempImagePath, bufferImage);

            const sticker = new Sticker(tempImagePath, {
                pack: PACKNAME,
                author: AUTHOR,
                type: getStickerType(options),
                quality: getStickerQuality(options)
            });

            stickerBuffer = await sticker.build();
            fs.unlinkSync(tempImagePath);
        } else {
            return m.reply('Please provide text or reply to an image/video/GIF');
        }
    } catch (e) {
        console.error(e);
        if (!stickerBuffer) stickerBuffer = e;
    } finally {
        if (stickerBuffer) {
            conn.sendFile(m.chat, stickerBuffer, 'sticker.webp', '', m, null);
        } else {
            throw 'Conversion failed. Please ensure you provide valid input: text, image, video, or GIF.';
        }
    }
};

Object.assign(handler, command.toHandlerObject());

const getStickerType = (options) => {
    if (options.includes('--crop')) return 'crop';
    else if (options.includes('--circle')) return 'circle';
    else return 'full';
};

const getStickerQuality = (options) => {
    if (options.includes('--low')) return 25;
    else if (options.includes('--medium')) return 50;
    else if (options.includes('--high')) return 100;
    else return 50;
};
