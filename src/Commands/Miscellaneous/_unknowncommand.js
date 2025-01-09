export async function before(m, { conn, match, usedPrefix }) {
    if ((usedPrefix = (match[0] || '')[0])) {
        const input = m.text.slice(usedPrefix.length).trim();
        const [commandName, ...args] = input.split(' ');
        const commands = Object.values(plugins).filter(v => v.command && !v.disabled);

        const help = commands.flatMap(v =>
            Array.isArray(v.command)
                ? v.command.concat(v.aliases || [])
                : [v.command].concat(v.aliases || [])
        );

        const isCommandFound = help.some(cmd => {
            if (cmd instanceof RegExp) return cmd.test(commandName);
            return cmd === commandName || `${commandName} ${args[0]}`.startsWith(cmd);
        });

        if (isCommandFound) return;
        conn.reply(m.chat, '💔 *No such command found!!*', m);
    }
}