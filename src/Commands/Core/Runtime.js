import Command from '../../Library/Command.js';
import displayLoadingScreen from '../../Library/loading.js';

const command = new Command('runtime', {
    description: "",
    aliases: ['uptime'],
    category: 'core',
    usage: 'runtime'
});

export default async function handler(m, { conn }) {
    await displayLoadingScreen(conn, m.chat);

    const pp = 'https://images-assets.nasa.gov/image/PIA10473/PIA10473~orig.jpg';
    
    const muptime = getUptime();
    const message = `あR U N T I M Eあ \n───────────────\n${muptime}`;

    const contextInfo = {
        mentionedJid: [m.sender],
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363178281296360@newsletter',
            newsletterName: global.author,
            serverMessageId: -1,
        },
        forwardingScore: 999,
        externalAdReply: {
            title: 'ʟᴜɴᴀʀ',
            body: 'R U N T I M E',
            thumbnailUrl: pp,
            sourceUrl: '',
            mediaType: 1,
            renderLargerThumbnail: false,
        },
    };

    conn.sendMessage(m.chat, { text: message, contextInfo });
}

Object.assign(handler, command.toHandlerObject());

//--Functions
function getUptime() {
    const uptimeInSeconds = process.uptime();
    return formatUptime(uptimeInSeconds);
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(remainingSeconds)}s`;
}

function pad(value) {
    return value.toString().padStart(2, '0');
}
