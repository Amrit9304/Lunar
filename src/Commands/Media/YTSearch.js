import yts from 'yt-search';
import Command from '../../Library/Command.js';

const command = new Command('ytsearch', {
    description: "Search media from YouTube",
    aliases: ['yts'],
    category: 'media',
    usage: 'yts_<url>'
});

export default async function handler(m, { conn, text: searchText }) {
  if (!searchText) return m.reply('🟥 *Sorry you did not give any search term!*');
  const { videos } = await yts(searchText);
  if (!videos || !videos.length) return m.reply(`🟨 *No videos found* | "${searchText}"`);
  let replyText = '';
  console.log(videos)
  const length = videos.length >= 10 ? 10 : videos.length;
  for (let i = 0; i < length; i++) {
    replyText += `*#${i + 1}*\n📗 *Title: ${videos[i].title}*\n📕 *Channel: ${videos[i].author.name}*\n📙 *Duration: ${
      videos[i].timestamp
    }s*\n👁️ *Views: ${formatViews(videos[i].views)}*\n📅 *Uploaded: ${videos[i].ago}*\n🔗 *URL: ${videos[i].url}*\n\n`;
  }
  conn.reply(m.chat, replyText);
};

Object.assign(handler, command.toHandlerObject());

function formatViews(views) {
  if (views >= 1000000000) {
    return `${(views / 1000000000).toFixed(1)}B`;
  } else if (views >= 1000000) {
    return `${(views / 1000000).toFixed(0)}M`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(0)}k`;
  } else {
    return views.toString();
  }
}
