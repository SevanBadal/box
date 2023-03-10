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
import { getSupabase } from '../Helpers/supabase.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const userHomeDir = homedir()

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1) // up one line
  process.stdout.clearLine(1) // from cursor to end
}


export const register = async (email, password, channel) => {
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
    })
    if(error){
      console.log(error.message)
    }else{
      const session = data.session;
      fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify({channel, session}));
    }
}

export const getMe = async (session) => {
  console.log(session)
  const { data: { user }, error} = await getSupabase(session.access_token).auth.getUser()
  if (error) {
    console.log(error)
  } else {
    console.log(user)
  }
}

export const login = async (email, password, {channel}) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if(error){
      console.log(error.message)
    }else{
      const session = data.session;
      fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify({channel, session}));
    }
}

export const logout = async (channel) => {
    const { error } = await supabase.auth.signOut()
    if(error){
      console.log(error.message)
    }else{
      console.log("Logged Out");
      // delete local stored session 
      fs.writeFileSync(userHomeDir + '/.boxrc.json', JSON.stringify({channel}));
    }
}