import Command from '../../Library/Command.js';

const command = new Command('define', {
  description: "Gives you the definition of the given word",
  aliases: ['d'],
  category: 'utils',
  usage: 'define [Word you want to search about]'
});

export default async function handler(m, { text }) {
  if (!text) throw 'Please provide a word to search for.';

  const url = `https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(text)}`;

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok) {
    throw `An error occurred: ${json.message}`;
  }

  if (!json.list.length) {
    throw 'Word not found in the dictionary.';
  }

  const firstEntry = json.list[0];
  const definition = firstEntry.definition;
  const example = firstEntry.example ? `*Example:* ${firstEntry.example}` : '';

  let message = `*Word:* ${text}\n*Definition:* ${definition}\n\n${example}`;
  m.reply(message);
};

Object.assign(handler, command.toHandlerObject());