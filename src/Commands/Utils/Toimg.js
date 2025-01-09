import Command from '../../Library/Command.js'
import { webp2png } from '../../Library/webp2mp4.js'

const command = new Command('toimg', {
    description: "Tags everyone in group",
    aliases: ['img'],
    category: 'utils',
    usage: 'img [quote_sticker]'
});

export default async function handler(m, { conn, usedPrefix, command }) {
    const notStickerMessage = `✳️ Reply to a sticker with :\n\n *${usedPrefix + command}*`
    if (!m.quoted) throw notStickerMessage
    const q = m.quoted || m
    let mime = q.mediaType || ''
    if (!/sticker/.test(mime)) throw notStickerMessage
    let media = await q.download()
    let out = await webp2png(media).catch(_ => null) || Buffer.alloc(0)
    await conn.sendFile(m.chat, out, 'out.png', '', m)
}

Object.assign(handler, command.toHandlerObject());