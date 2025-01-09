import instagram from '../Media/Instagram.js';
import YTCard from '../Media/YTVideo.js'

const instagramRegex = /https:\/\/www\.instagram\.com\/(reel|p|tv)\/[A-Za-z0-9_\-]+/;
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

export async function before(m, { conn }) {
    if (instagramRegex.test(m.text)) {
        await instagram(m, { conn, text: m.text.match(instagramRegex)[0] });
    }

    // if (youtubeRegex.test(m.text)) {
    //     await YTCard(m, { conn, text: m.text.match(youtubeRegex)[0] });
    // }
}