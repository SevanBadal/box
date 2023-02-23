import { createClient } from '@supabase/supabase-js'
import path from 'path'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({path: path.join(__dirname, '../.env')})

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const getSupabase = (access_token) => {
    let options = {}
  
    if (access_token) {
      options.global = {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    }
  
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      options
    )
    return supabase
  }
  
  export { getSupabase }