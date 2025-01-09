import { canLevelUp } from '../../Library/levelling.js'

export async function before(m, { conn }) {
    let user = global.db.data.users[m.sender];
    if (!user.autolevelup) return false;

    let before = user.level * 1;
    while (canLevelUp(user.level, user.exp, global.multiplier)) {
        user.level++;
    }

    user.role = global.rpg.role(user.level).name;

    if (before !== user.level) {
        let message = `*${user.name} leveled up!*\n\n`;
        message += `*CONGRATS*\n`;
        message += `You are now at level *${user.level}*!!!`;

        try {
            await conn.sendMessage(m.chat, {
                video: {
                    url: 'https://media.tenor.com/msfmevhmlDAAAAPo/anime-chibi.mp4'
                },
                caption: message,
                gifPlayback: true,
                gifAttribution: 0
            }, { quoted: m });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    }
}