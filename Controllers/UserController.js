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

const getPassword = () => {

  return new Promise((resolve) => {
    // Turn off terminal echoing
    let password = '';
    output.write('Password: ');
    input.setRawMode(true);
    input.resume();
    input.setEncoding('utf8');
    input.on('data', (key) => {
      // add check for backspace and remove last char in password and remove last char in output
      if (key === '\u0008' || key === '\u007f'){
        if (password.length > 0) {
          password = password.slice(0, -1);
          output.clearLine(-1); // Clear the current line
          output.cursorTo(0);    // Move cursor to the start of the line
          output.write('Password: ' + '*'.repeat(password.length));
        }
      } else if (key === '\n' || key === '\r' || key === '\u0004') {
        // They've finished typing their password
        input.setRawMode(false);
        input.pause();
        input.removeAllListeners('data');
        resolve(password);
      } else if (key === '\u0003') {
        // Allow CTRL+C to exit process
        process.exit();
      } else {
        // Mask password
        output.write('*');
        password += key;
      }
    });
  });
};


export const register = async (email, channel) => {
    // should wait for user input for password, password shouldn't be visible
    const password = await getPassword()

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
  if(!session) {
    console.log("You are not logged in")
    return
  }
  const { data: { user }, error} = await getSupabase(session.access_token).auth.getUser()
  if (error) {
    console.log(error)
  } else {
    console.log(user)
  }
}

export const login = async (email, {channel}) => {
    const password = await getPassword()
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