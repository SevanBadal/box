import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getMessages = async (channel) => {
  let { data: message, error } = await supabase
    .from("message")
    .select("id")
    .eq("receiver", channel);
  console.log("box/" + channel);
  const indentDepth = channel.length + 4;
  const spaces = Array.from({ length: indentDepth }, () => "-").join("");
  message.forEach((x) => console.log(spaces + x.id));
};

export const getDetailedMessages = async (channel) => {
  let { data: message, error } = await supabase
    .from('message')
    .select('id, sender, created_at')
    .eq('receiver', channel)
  console.log(`total: ${message.length}`)
  message.forEach((x, i)=> console.log( `${x.id}  ${x.sender}  ${x.created_at}` ))
}

export const getMessage = async (id) => {
  let { data: message, error } = await supabase
    .from("message")
    .select("content, sender")
    .eq("id", id);
  message.forEach((x) => {
    console.log("\n" + x.content);
  });
};

export const replyToMessage = async (id, content, sender) => {
  let { data: message, error } = await supabase
    .from("message")
    .select("content, sender, created_at")
    .eq("id", id)
    .single();
  let threadBuilder = "";
  threadBuilder =
    content +
    "\n ~ " +
    sender +
    "\n" +
    `\n\n-------------------${message.created_at}\n\n`;
  threadBuilder = threadBuilder + message.content + "\n\n";
  const { data: new_message, error: new_message_error } = await supabase
    .from("message")
    .insert([
      { receiver: message.sender, sender, content: threadBuilder },
    ]);
};

export const deleteMessages = async (ids) => {
  const listOfIds = ids.split(",");
  const { data, error } = await supabase
    .from('message')
    .delete()
    .in('id', listOfIds)
}

export const sendMessage = async (receiver, sender, content) => {
  const { data, error } = await supabase
  .from('message')
  .insert([
    { receiver, 
      sender, 
      content: content + '\n ~ ' + sender + '\n'
    },
  ])
  if (error) {
    console.log('send error', error)
  }
}
