import Command from '../../Library/Command.js';

const categories = [
	{
		id: 'ai',
		font: 'AI',
		emoji: '🤖'
	},
    {
		id: 'core',
		font: 'CORE',
		emoji: '🔰'
	},
	{
		id: 'fun',
		font: 'FUN',
		emoji: '🎉'
	},
	{
		id: 'media',
		font: 'MEDIA',
		emoji: '🔉'
	},
	{
		id: 'moderation',
		font: 'MODERATION',
		emoji: '💮'
	},
	{
		id: 'utils',
		font: 'UTILS',
		emoji: '⚙️'
	},
	{
		id: 'weebs',
		font: 'WEEBS',
		emoji: '🎐'
	}
];

const command = new Command('help', {
	description: "Displays all available commands",
	aliases: ['h', 'command'],
	category: 'core',
	usage: 'help',
});

export default async function handler(m, { conn, usedPrefix }) {
	let inputCommand = m.text.split(' ')[1];
	let commands = Object.values(plugins).filter(v => v.command && !v.disabled);
	const commandMap = {};

	for (const cmd of commands) {
		const {
			category
		} = cmd;

		if (!commandMap[category]) {
			commandMap[category] = [];
		}
		commandMap[category].push(cmd.command[0]);
	}

	if (inputCommand) {
		let get = commands.find(plugin => {
			const isValidCommand = plugin.command && Array.isArray(plugin.command);
			const isValidAlias = plugin.aliases && Array.isArray(plugin.aliases);
			return (
				(isValidCommand && plugin.command.includes(inputCommand)) ||
				(isValidAlias && plugin.aliases.includes(inputCommand))
			);
		});

		if (get) {
			let { command: mainCommand, description, aliases, usage, category } = get;

			let displayAliases = inputCommand === mainCommand[0] ?
				aliases :
				[mainCommand[0], ...aliases];

			displayAliases = displayAliases.filter(alias => alias !== inputCommand);

            let message = `🟥 *Command:* ${inputCommand}\n`
                message += `🟧 *Aliases:* ${displayAliases.length > 0 ? displayAliases.join(', ') : ''}\n`
                message += `🟨 *Category:* ${category}\n`
                message += `🟪 *Usage:* ${usage ? `${usage}` : ''}\n`
                message += `⬜ *Description:* ${description}`

			conn.reply(m.chat, message, m);
		} else {
			conn.reply(m.chat, '❌ No such command found!', m);
		}
	} else {
		for (const category in commandMap) {
			commandMap[category] = [...new Set(commandMap[category])];
			commandMap[category].sort();
		}

		let img = 'https://i.pinimg.com/564x/3b/d8/bb/3bd8bb87812f4af49d6a52b7a2394c6d.jpg'

		let response = '⟾ *📪Command list📪*'

		for (const { id, font, emoji }
			of categories) {
			if (commandMap[id]) {
                const style = '```'
				response += `\n\n${emoji} *${font}*\n`;
				response += `${style}❐ ${commandMap[id].join(', ')}${style}`;
			}
		}

		response += `\n\n*📇 Notes:*\n`
		response += `*➪ Use ${usedPrefix}help <command name> to see its info*\n`
		response += `*➪ Eg: ${usedPrefix}help profile*`
		await conn.sendMessage(
			m.chat, {
				image: {
					url: img
				},
				caption: response
			},
            {
				quoted: m
			}
		)
	}
}

Object.assign(handler, command.toHandlerObject());