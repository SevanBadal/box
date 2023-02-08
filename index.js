#!/usr/bin/env node
import * as dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os'
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({path: path.join(__dirname, '.env')});

const userHomeDir = homedir()

// supabase configs
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const args = process.argv
const [one, two, ...cmds] = args

fs.readFile(userHomeDir + '/.boxrc.json', 'utf8', async function(err, data) {
  let channel = "global"
  if (data) {
    channel = JSON.parse(data)?.channel;
  }
  // no commands then exit
  if (cmds.length === 0) {
    console.log("current box: " + channel)
    process.exit(0)
  }
  if (cmds.length === 1 && cmds[0] == '--help') {
    const calcSpaces = (buffer) => {
      const spaces = Array.from({length: 25 - buffer}, () => " ").join("");
      return spaces
    }
    console.log("common Box commands:")
    console.log("box w/out args prints the current box name")
    console.log("ls"  + calcSpaces("ls".length) + "list ids in current box")
    console.log("ls -l"  + calcSpaces("ls -l".length) + "list ids, sender box and timestamp")
    console.log("cat <id>"  + calcSpaces("cat <id>".length) + "prints the contents of a message in the current box")
    console.log("checkout <box-name>"  + calcSpaces("checkout <box-name>".length) + "sets the local box as the specified box name")
    console.log("checkout -b <box-name>"  + calcSpaces("checkout -b <box-name>".length) + "creates a remote box (if not already on remote) and sets the local box to the specified box name")
    console.log("rm <id>"  + calcSpaces("rm <id>".length) + "deletes the box of a given id")
    process.exit(0)
  }
  // ls messages in user channel
  if (cmds.length === 1 && cmds[0] === 'ls') {
    let { data: message, error } = await supabase
      .from('message')
      .select('id')
      .eq('receiver', channel)
      console.log('box/' + channel)
    const indentDepth = channel.length + 4
    const spaces = Array.from({length: indentDepth}, () => "-").join("");
    message.forEach(x => console.log(spaces + x.id))
    process.exit(0)
  }

  if (cmds.length === 2 && cmds[0] === 'checkout') {
    const newConfigObject = {channel: cmds[1]} 
    fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify(newConfigObject)); 
    console.log(`Checked out into box ${cmds[1]}`)
    process.exit(0)
  }

  if (cmds.length === 3 && cmds[0] === 'checkout' && cmds[1] === '-b') {
    const newConfigObject = {channel: cmds[1]} 
    const { data, error } = await supabase
      .from('channel')
      .insert([
        { name: cmds[2]},
      ])
    if (!error) {
      console.log(data)
      fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify(newConfigObject)); 
      console.log(`Checked out into box ${cmds[1]}`)
    } else {
      if (error.code == '23505') {
        console.log("remote channel " + channel + " already on exists")
        console.log("checked out into " + channel)
      }
    }

    process.exit(0)
  }

  if (cmds.length === 2 && cmds[0] === 'ls' && cmds[1] === '-l') {
    let { data: message, error } = await supabase
      .from('message')
      .select('id, sender, created_at')
      .eq('receiver', channel)
    console.log(`total: ${message.length}`)
    message.forEach((x, i)=> console.log( `${x.id}  ${x.sender}  ${x.created_at}` ))
    process.exit(0)
  } 
  if (cmds.length === 2 && cmds[0] === 'cat') {
    let { data: message, error } = await supabase
        .from('message')
        .select('content, sender')
        .eq('id', cmds[1])
    message.forEach(x => {
      console.log('\n' + x.content)
      console.log('\n - ' + x.sender + '\n')
    })
    process.exit(0)
  }
  if (cmds.length === 2 && cmds[0] === 'rm') {
    const { data, error } = await supabase
      .from('message')
      .delete()
      .eq('id', cmds[1])
    process.exit(0)
  }
  // send a message to channel - ["<channel-name>", "message"]
  if (cmds.length === 2 ) {
    const { data, error } = await supabase
      .from('message')
      .insert([
      { receiver: cmds[0], sender: channel, content: cmds[1] },
      ])
    if (error) {
      console.log('send error', error)
    }
    process.exit(0)
  }
});