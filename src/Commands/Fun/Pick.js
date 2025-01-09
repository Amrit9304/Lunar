import Command from '../../Library/Command.js'
import { random } from '../../Library/function.js'

const command = new Command('pick', {
    description: "Randomly tag a user",
    aliases: [],
    category: 'fun',
    usage: 'pick',
    group: true
});

export default async function handler(m, { conn, args, groupMetadata }) {
    const arg = args.join(' ')
    const groupMembers = groupMetadata?.participants.map((x) => x.id) || [];
    const randomMem = random(groupMembers);
        conn.reply(m.chat, `${arg ? `${arg}` : '*Random_Pick:*'} @${randomMem.split('@')[0]}`, m, { mentions: [randomMem]});
};

Object.assign(handler, command.toHandlerObject());