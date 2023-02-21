#!/usr/bin/env node
import { homedir } from 'os'
import * as fs from 'fs';
import { deleteMessages, getDetailedMessages, getMessage, getMessages, replyToMessage, sendMessage } from './Controllers/MessageController.js';
import { connectToChannel, createChannel, getChannels, updateChannel } from './Controllers/ChannelController.js';
import { register, login, logout } from './Controllers/UserController.js';
const userHomeDir = homedir()
const args = process.argv
const [one, two, ...cmds] = args

fs.readFile(userHomeDir + '/.boxrc.json', 'utf8', async function(err, data) {
  let channel = "global"
  let session = undefined
  if (data) {
    let sessionData = JSON.parse(data)
    channel = sessionData?.channel;
    session = sessionData?.session;
  }
  if (cmds.length === 1 && cmds[0] == '--help') {
    const calcSpaces = (buffer) => {
      const spaces = Array.from({length: 25 - buffer}, () => " ").join("");
      return spaces
    }
    console.log("common Box commands:")
    console.log("box w/out args prints the current box name")
    console.log(`<box-name> "message"` + calcSpaces(`<box-name> "message"`.length) + "Send a message to the specified box name") 
    console.log("ls"  + calcSpaces("ls".length) + "list ids in current box")
    console.log("ls -l"  + calcSpaces("ls -l".length) + "list ids, sender box and timestamp")
    console.log("cat <id>"  + calcSpaces("cat <id>".length) + "prints the contents of a message in the current box")
    console.log("ls -c"  + calcSpaces("ls -l".length) + "list channels")
    console.log("checkout <box-name>"  + calcSpaces("checkout <box-name>".length) + "sets the local box as the specified box name")
    console.log("checkout -b <box-name>"  + calcSpaces("checkout -b <box-name>".length) + "creates a remote box (if not already on remote) and sets the local box to the specified box name")
    console.log("<channel> <message>" + calcSpaces("<channel> <message>".length)+ "sends a message to the specific channel")
    console.log("rm <id>"  + calcSpaces("rm <id>".length) + "deletes the box of a given id")
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'open') {
    await connectToChannel(cmds[1], channel)
    process.exit(0)
  }
  if (cmds.length === 0) {
    console.log("current box: " + channel)
    process.exit(0)
  }
  if (cmds.length === 1 && cmds[0] === 'ls') {
    await getMessages(channel, session)
    process.exit(0)
  }
  if (cmds.length === 1 && cmds[0] === 'logout') {
    await logout(channel)
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'ls' && cmds[1] === '-l') {
    await getDetailedMessages(channel)
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'ls' && cmds[1] === '-c') {
    await getChannels();
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'checkout') {
    await updateChannel(cmds[1])
    process.exit(0)
  }
  if (cmds.length === 3 && cmds[0] === 'reply') {
    await replyToMessage(cmds[1], cmds[2], channel)
    process.exit(0)
  }
  if (cmds.length === 3 && cmds[0] === 'checkout' && cmds[1] === '-b') {
    await createChannel(cmds[2])
    process.exit(0)
  }
  if (cmds.length === 3 && cmds[0] === 'register') {
    await register(cmds[1], cmds[2])
    process.exit(0)
  }
  if (cmds.length === 3 && cmds[0] === 'login') {
    await login(cmds[1], cmds[2], {channel})
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'cat') {
    await getMessage(cmds[1], channel, session)
    process.exit(0);
  }
  if (cmds.length === 2 && cmds[0] === 'rm') {
    await deleteMessages(cmds[1], session)
    process.exit(0)
  }
  // send a message to channel - ["<channel-name>", "message"]
  if (cmds.length === 2 ) {
    await sendMessage(cmds[0], channel, cmds[1], session)
    process.exit(0)
  }
});