import getRole from '../../Library/role.js';
import Command from '../../Library/Command.js';
import { xpRange } from '../../Library/levelling.js';
import generateCustomRankCard from '../../Library/cardify.js';

const command = new Command('rank', {
    description: "Displays user's rank",
    aliases: ['r'],
    category: 'core',
    usage: 'rank [tag/quote user]',
});

export default async function handler(m, { conn }) {
    const who = m.quoted
        ? m.quoted.sender
        : (m.mentionedJid && m.mentionedJid.length > 0
            ? m.mentionedJid[0]
            : (m.fromMe ? conn.user.jid : m.sender));

    if (!(who in global.db.data.users)) {
        throw '✳️ The user is not found in my database';
    }

    let users = Object.entries(global.db.data.users).map(([key, value]) => {
        return { ...value, jid: key };
    });
    let sortedExp = users.map(toNumber('exp')).sort(sort('exp'));
    let usersExp = sortedExp.map(enumGetKey);

    const pp = await conn.profilePictureUrl(who, 'image').catch(() => './assets/images/redmoon.jpg');
    const user = global.db.data.users[who];
    const username = conn.getName(who);
    const { exp, level } = user;
    const role = getRole(user.level);

    const { min, xp } = xpRange(level, global.multiplier);
    const currentXp = exp - min;
    const requiredXpToLevelUp = xp;

    const rankDetails = {
        username,
        avatarURL: pp,
        serverRank: `#${usersExp.indexOf(m.sender) + 1}`,
        weeklyRank: '#1',
        weeklyXP: '7',
        level,
        role: `|➢ ${role}`,
        currentXP: currentXp,
        requiredXP: requiredXpToLevelUp,
        discriminator: who.substring(3, 7),
        backgroundColor: 'transparent', //'#313338',
        theme: ['#FCE7A8'][Math.floor(Math.random() * 3)] //mod red #E74D3D
    };

    try {
        const rankCardPath = await generateCustomRankCard(rankDetails);

        const rankDetailsMessage = `*|➢ ⬡ ${username}*\n` +
            `*━━━━━━━━━━━━━━━━‣*\n` +
            `🏅 *Rank  →  ${role}*`
            // `*━━━━━━━━━━━━━━━━‣*\n` +
            // `🍀 *Level → ${level}*\n` +
            // `⭐ *Experience → ${currentXp} / ${requiredXpToLevelUp}*`

        await conn.sendFile(m.chat, rankCardPath, 'rank.jpg', rankDetailsMessage, m, false, { mentions: [who] });
    } catch (error) {
        console.error('Error generating or sending rank card:', error);
    }
}

Object.assign(handler, command.toHandlerObject());

function sort(property, ascending = true) {
    if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property]
    else return (...args) => args[ascending & 1] - args[!ascending & 1]
}

function toNumber(property, _default = 0) {
    if (property) return (a, i, b) => {
        return { ...b[i], [property]: a[property] === undefined ? _default : a[property] }
    }
    else return a => a === undefined ? _default : a
}

function enumGetKey(a) {
    return a.jid
}