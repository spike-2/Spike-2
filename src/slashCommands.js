/**
 * @author Brandon Ingli
 * Deals with adding, handling, and removing slash commands
 */

const {getConsts} = require("./faccess.js");
const GUILDID = getConsts().guild;

var bot;

const setBot = (theBot) => {
  bot = theBot;
}

/**
 * Get the API App object
 * @returns API App required for interacting with the api
 */
const getApp = () => {
  return app = bot.api.applications(bot.user.id).guilds(GUILDID);
}

/**
 * Get currently enrolled slash commands
 * @returns {Object[]} An array of objects representing slash commands
 */
const getCommands = async () => {
  const commands = await getApp().commands.get();
  return commands;
}

/**
 * Add or Update a Command. Passing the name of an existing command updates it.
 * @param {string} name Name of the command
 * @param {string} description Description of the command
 * @param {Object} [options=null] An array of options for the command. See https://discord.com/developers/docs/interactions/slash-commands#registering-a-command
 */
const addCommand = async (name, description, options = null) => {
  await getApp().commands.post({
    data: {
      name: name,
      description: description,
      options: options
    }
  });
}

/**
 * Delete a command
 * @param {string} commandId The ID of the command to delete
 */
const deleteCommand = async(commandId) => {
  await getApp().commands(commandId).delete();
}

/**
 * Reply to an interaction.
 * @param {string} response Response to send
 * @param {Object} interaction The interaction to reply to
 */
const reply = (response, interaction) => {
  interaction.callback.post({
    data: {
      type: 4,
      data: {
        content: response
      }
    }
  });
}

/**
 * Bulk add the slash commands we want.
 */
const addAllCommands = () => {
  addCommand("Ping", "A simple ping-pong command.");
}

/**
 * Handle a new Interaction
 * @param {Interaction} interaction The interaction to interact with.
 * 
 * Member: https://discord.com/developers/docs/resources/guild#guild-member-object
 * Options: [{value: "", type: 4, name: "name"}, ...]
 */
const handleInteraction = async (interaction) => {
  const {name, options, member} = interaction.data;
  const command = name.toLowerCase();

  if (command === "ping"){
    reply(`${member.user.username}, pong!`, interaction);
  }
};

module.exports = {setBot, getCommands, addCommand, addAllCommands, deleteCommand, handleInteraction};