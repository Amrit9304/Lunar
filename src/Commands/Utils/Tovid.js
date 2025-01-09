import { webp2mp4 } from '../../Library/webp2mp4.js'
import { ffmpeg } from '../../Library/converter.js'
import Command from '../../Library/Command.js';

const command = new Command('Tovid', {
    description: "Coverts gif sticker to video",
    aliases: ['tovid'],
    category: 'utils',
    usage: 'tovid [quote_sticker]'
});

export default async function handler(m, { conn }) {
  if (!m.quoted) throw 'Respond to an animated sticker'
  let mime = m.quoted.mimetype || ''
  if (!/webp|audio/.test(mime)) throw 'Respond to an animated sticker'
  let media = await m.quoted.download()
  let out = Buffer.alloc(0)
  if (/webp/.test(mime)) {
    out = await webp2mp4(media)
  } else if (/audio/.test(mime)) {
    out = await ffmpeg(
      media,
      [
        '-filter_complex',
        'color',
        '-pix_fmt',
        'yuv420p',
        '-crf',
        '51',
        '-c:a',
        'copy',
        '-shortest',
      ],
      'mp3',
      'mp4'
    )
  }
  await conn.sendFile(m.chat, out, 'tovid.mp4', '✅ sticker a video', m)
}

Object.assign(handler, command.toHandlerObject());