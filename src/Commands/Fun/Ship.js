import Command from '../../Library/Command.js';
import { Ship } from '@shineiichijo/canvas-chan';

const command = new Command('ship', {
    description: "Ship People! ♥",
    aliases: [],
    category: 'fun',
    usage: 'ship [tag user1] [tag user2]',
    group: true
});

export default async function handler(m, { conn }) {
    const mentionedJid = m.mentionedJid;

    if (mentionedJid.length !== 1 && mentionedJid.length !== 2) {
        await conn.reply(m.chat, 'Please tag one or two users to ship.', m);
        return;
    }

    const profile = 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'

    const user1 = mentionedJid.length === 2 ? mentionedJid[0] : m.sender;
    const userName1 = conn.getName(user1);
    const userImage1 = await conn.profilePictureUrl(user1, 'image').catch(_ => profile)

    const user2 = mentionedJid[mentionedJid.length === 2 ? 1 : 0];
    const userName2 = conn.getName(user2);
    const userImage2 = await conn.profilePictureUrl(user2, 'image').catch(_ => profile);

    const shipArray = [
        { name: userName1, image: userImage1, mention: user1 },
        { name: userName2, image: userImage2, mention: user1 }
    ];

    const percentage = Math.floor(Math.random() * 101);

    let text = '';
    if (percentage < 10) text = 'Awful';
    else if (percentage < 25) text = 'Very Bad';
    else if (percentage < 40) text = 'Poor';
    else if (percentage < 55) text = 'Average';
    else if (percentage < 75) text = 'Good';
    else if (percentage < 90) text = 'Great';
    else text = 'Amazing';

    const ship = new Ship(shipArray, percentage, text);
    const image = await ship.build();

    const caption = `\`\`\`🔺 Compatibility Meter 🔺\`\`\`
💖 @${user1.split('@')[0]} x @${user2.split('@')[0]} 💖
*🔻 ${percentage}% ${percentage < 50 ? '💔' : '💞'} ${text} 🔻*`;

    conn.sendMessage(
        m.chat, { 
            image: image,
            caption: caption,
            mentions: [user1, user2] 
        },
        { 
            quoted: m 
        }
    );
};

Object.assign(handler, command.toHandlerObject());
