import Command from '../../Library/Command.js';

const command = new Command('eval', {
  description: 'Compile and execute JavaScript code.',
  category: 'utils',
  usage: `#eval <code>`,
});

export default async function handler(m, { text }) {
  if (!text) return m.reply('❌ Sorry, you did not provide any code!');

  let out = '';
  try {
    // Ensure that we capture the result from eval() properly
    const result = await eval(`(async () => { ${text} })()`);

    // If the result is undefined, we still want to show a success message
    out = result !== undefined ? String(result) : 'Executed JS Successfully!';
  } catch (err) {
    // Handle and display any errors
    out = `❌ Error: ${err.message}`;
  }

  // Send the output (result or error message)
  await m.reply(out);
}

// Assign metadata to the handler
Object.assign(handler, command.toHandlerObject());