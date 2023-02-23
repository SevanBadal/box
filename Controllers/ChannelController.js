import path from 'path'
import { homedir } from 'os'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({path: path.join(__dirname, '../.env')})
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const userHomeDir = homedir()

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1) // up one line
  process.stdout.clearLine(1) // from cursor to end
}

export const getChannels = async () => {
  let { data: message, error } = await supabase
    .from('channel')
    .select('name')
  console.log(`total: ${message.length}`)
  const indentDepth = `total: ${message.length}`.length
  const spaces = Array.from({length: indentDepth}, () => "-").join("");
  message.forEach((x, i)=> console.log( spaces + `${x.name}` ))
  console.log(`create a new box: box checkout -b <box-name>`)
}

export const updateChannel = async (channel, session) => {
  const newConfigObject = {channel, session} 
  fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify(newConfigObject)); 
  console.log(`Checked out into box ${channel}`)
}

export const createChannel = async (channel, session) => {
  const newConfigObject = {channel, session} 
  const { data, error } = await supabase
    .from('channel')
    .insert([
      { name: channel},
    ])
  if (!error) {
    fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify(newConfigObject)); 
    console.log(`Checked out into box ${channel}`)
  } else {
    if (error.code == '23505') {
      fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify(newConfigObject)); 
      console.log("remote channel " + newConfigObject.channel + " already exists")
      console.log("checked out into " + newConfigObject.channel)
    }
  }
}

export const connectToChannel = async (receiver, sender) => {
  console.log("You're in " + receiver + "'s box")
  const rl = readline.createInterface({ input, output });
  supabase
    .channel('any')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message', filter: `receiver=eq.${receiver}` }, payload => {
        console.log(payload.new.content)
      })
      .subscribe()
  while (true) {
    const input = await rl.question("");
    clearLastLine()
    if (input === ":quit") {
      break;
    } else {
      const { data, error } = await supabase
      .from('message')
      .insert([
        { receiver, sender, content: input + '\n ~ ' + sender + '\n'  },
      ])
    }
  }
  rl.close();
}