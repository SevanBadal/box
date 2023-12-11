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
import { getSupabase } from "../Helpers/supabase.js";


const userHomeDir = homedir()

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1) // up one line
  process.stdout.clearLine(1) // from cursor to end
}

export const getChannels = async () => {
  const supabase = getSupabase()
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
  const supabase = getSupabase(session.access_token)
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

export const connectToChannel = async (receiver, sender, session) => {
  const supabase = getSupabase(session.access_token)
  supabase.realtime.accessToken = session.access_token
  const rl = readline.createInterface({ input, output });

  const channel = supabase
    .channel('any')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'message', filter: `receiver=eq.${receiver}` }, 
    (payload) => {
      console.log(payload.new.content)
    })
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("You're in " + receiver + "'s box\n")
      } else if (status === "CLOSED") { 
        console.log("You have quit the session.")
      } else {
        throw new Error("The connection failed")
      }
    })
 

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
      if (error) {
        console.log(error)
      }
    }
  }
  channel.unsubscribe()
  supabase.removeAllChannels()
  rl.close();
}