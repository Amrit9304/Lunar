import getRole from '../../Library/role.js';
import Command from '../../Library/Command.js';

const command = new Command('leaderboard', {
    description: "Displays global or group's leaderboard of a specific field",
    aliases: ['lb'],
    category: 'core',
    usage: 'leaderboard (--group) [-cards | --wallet | --bank | --gold]'
});

export default async function handler(m, { conn, args, participants }) {
    const isGroup = args.includes('--group');

    let users = isGroup
        ? participants.map(u => u.id).map(id => {
            let user = global.db.data.users[id] || {};
            return { ...user, jid: id };
        })
        : Object.entries(global.db.data.users).map(([jid, user]) => ({ ...user, jid }));

    users.forEach(user => {
        if (typeof user.exp !== 'number') user.exp = 0;
        if (typeof user.credit !== 'number') user.credit = 0;
        if (typeof user.bank !== 'number') user.bank = 0;
        if (!user.cards) user.cards = [];
    });

    let totaluser = users.length;

    let sortField = 'exp';
    if (args.includes('--wallet')) sortField = 'credit';
    if (args.includes('--bank')) sortField = 'bank';
    if (args.includes('--gold')) sortField = 'totalGold';
    if (args.includes('--cards')) sortField = 'totalCards';
    if (args.includes('--exp')) sortField = 'exp';

    users.forEach(user => {
        user.totalGold = user.credit + user.bank;
        user.totalCards = getTotalCards(user.jid);
    });

    let sortedUsers = users.sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));
    let usersList = sortedUsers.map(enumGetKey);

    let len = Math.min(10, sortedUsers.length);

    let text = `
👑 *${isGroup ? 'GROUP' : 'GLOBAL'} LEADERBOARD* 👑

*Your position is ${usersList.indexOf(m.sender) + 1} out of ${totaluser} users*

${sortedUsers.slice(0, len).map(({ jid, exp, level, credit, bank }, i) => {
        let username = conn.getName(jid) || "Unknown User";
        let role = getRole(level || 0);
        let totalGold = credit + bank;
        let totalCards = TotalCards(jid);

        return `*#${i + 1}.*  
*👑 Username:* ${username}  
*🌟 Experience:* ${exp || 0}  
*🏆 Role:* ${role}
*✨ Level:* ${level || 0}  
*👛 Wallet:* ${credit || 0}  
*🏦 Bank:* ${bank || 0}  
*💰 Total Gold:* ${totalGold || 0}  
*🃏 Total Cards:* ${totalCards || 0}`;
    }).join('\n\n')}
`.trim();

    conn.reply(m.chat, text, m, {
        mentions: sortedUsers.slice(0, len).map(u => u.jid),
    });
}

Object.assign(handler, command.toHandlerObject());

function TotalCards(jid) {
    const userCards = global.db.data.cards[jid] || {};
    const collectionCount = userCards.collection ? userCards.collection.length : 0;
    const deckCount = userCards.deck ? userCards.deck.length : 0;
    return collectionCount + deckCount;
}

function enumGetKey(a) {
    return a.jid;
}
