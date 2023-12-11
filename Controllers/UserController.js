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
import nodeNotifier from 'node-notifier'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const userHomeDir = homedir()

const clearScreen = () => {
  process.stdout.write('\x1B[2J\x1B[0f');
};

const logFormattedSync = (sync) => {
  Object.values(sync).forEach(userArray => {
    const formattedString = userArray.map(x => {
      const localTime = new Date(x.online_at).toLocaleString(); // Converts to local time string
      return `${x.user} ${localTime}`;
    }).join("\n");
    console.log('👋', formattedString);
  });
}

function findNewUsers(newState, previousState) {
  const newUsers = [];
  for (const key in newState) {
    if (newState.hasOwnProperty(key) && (!previousState[key] || previousState[key].length < newState[key].length)) {
      newState[key].forEach(user => {
        if (!previousState[key] || !previousState[key].some(prevUser => prevUser.user === user.user)) {
          newUsers.push(user.user);
        }
      });
    }
  }
  return newUsers;
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

export const wave = async (session) => {
  const supabase = getSupabase(session.access_token)
  supabase.realtime.accessToken = session.access_token
  const rl = readline.createInterface({ input, output });
  const userStatus = {
    user: session.user.email,
    online_at: new Date().toISOString(),
  }
  let previousState = {}
  const waveRoom = supabase
    .channel('wave')
    .on('presence', { event: 'sync' }, () => {
      const newState = waveRoom.presenceState();
      const newUsers = findNewUsers(newState, previousState);
      if (newUsers.length > 0) {
        nodeNotifier.notify({
          title: "New users have entered 📦",
          message: newUsers.join(', '),
          sound: true
        });
      }
      previousState = newState;
      clearScreen();
      logFormattedSync(newState);
    })
    .subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') { return }
    
      const presenceTrackStatus = await waveRoom.track(userStatus)
      console.log(presenceTrackStatus)
    })

    while (true) {
      console.log("type :quit to exit")
      const input = await rl.question("");
      if (input === ":quit") {
          const presenceUntrackStatus = await waveRoom.untrack()
          console.log(presenceUntrackStatus)
          break;
      }
    }
    console.log("cleaning up and closing...")
    waveRoom.unsubscribe()
    supabase.removeAllChannels()
    rl.close();
}