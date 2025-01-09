import Command from '../../Library/Command.js';
import { addExif } from '../../Library/sticker.js'

const command = new Command('wm', {
    description: 'Set custom watermark on sticker',
    aliases: ['take'],
    category: 'utils',
    usage: 'wm (quote sticker)',
    group: true
});

export default async function handler(m, { conn, args }) {
  if (!m.quoted) throw 'Respond to sticker'
  let stiker = false
       let stick = args.join(" ").split("|");
       let f = stick[0] !== "" ? stick[0] : '';
       let g = typeof stick[1] !== "undefined" ? stick[1] : '';
  try {
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) throw 'Respond to sticker'
    let img = await m.quoted.download()
    if (!img) throw 'Respond to sticker!'
    stiker = await addExif(img, f, g)
  } catch (e) {
    console.error(e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) conn.sendFile(m.chat, stiker, 'wm.webp', '', m, null, rpl)
     else throw 'Conversion failed'
  }
}

Object.assign(handler, command.toHandlerObject());