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


export const register = async (email, password) => {
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
    })
    if(error){
      console.log(error.message)
    }else{
      console.log('User created successfully')
      // save user data and session locally i think data.user??
    }
}


export const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if(error){
      console.log(error.message)
    }else{
      console.log("Login Succcesfull");
      //console.log(data);
      const userData = JSON.stringify(data);

      // save data.session in a local file

      // Attempt using AppendFile
      // fs.appendFile(userHomeDir + '/.boxrc.json', 'write this to file bitch', 'utf8', function(err)  {
      //   if (err) throw err;
      //   console.log('Session Data written to file.');
      // });

      // Attempt using Writeable Streams
        //const addUserInfo = fs.createWriteStream(userHomeDir + '/.boxrc.json', { flags: 'a' });
        // on new log entry ->
        //addUserInfo.write('this is new stuff');
        // you can skip closing the stream if you want it to be opened while
        // a program runs, then file handle will be closed
        //addUserInfo.end();
    }
}

export const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if(error){
      console.log(error.message)
    }else{
      console.log("Logged Out");
      // delete local stored session 
    }
}