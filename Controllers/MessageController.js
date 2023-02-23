import path from "path";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
import { getSupabase } from "../Helpers/supabase.js";
import { errorHandler } from "../Helpers/errorHandler.js"
export const getMessages = async (channel, session) => {
  let { data: message, error } = await getSupabase(session.access_token)
    .from("message")
    .select("id")
    .eq("receiver", channel);
  errorHandler(error)
  console.log("box/" + channel);
  const indentDepth = channel.length + 4;
  const spaces = Array.from({ length: indentDepth }, () => "-").join("");
  message.forEach((x) => console.log(spaces + x.id));
};

export const getDetailedMessages = async (channel, session) => {
  let { data: message, error } = await getSupabase(session.access_token)
    .from('message')
    .select('id, sender, created_at')
    .eq('receiver', channel)
  errorHandler(error)
  console.log(`total: ${message.length}`)
  message.forEach((x, i)=> console.log( `${x.id}  ${x.sender}  ${x.created_at}` ))
}

export const getMessage = async (id, channel, session) => {
  let { data: message, error } = await getSupabase(session.access_token)
    .from("message")
    .select("content, sender")
    .eq("id", id);
  errorHandler(error)
  message.forEach((x) => {
    console.log("\n" + x.content);
  });
};

export const replyToMessage = async (id, content, sender, session) => {
  let { data: message, error } = await getSupabase(session.access_token)
    .from("message")
    .select("content, sender, created_at")
    .eq("id", id)
    .single();
  errorHandler(error)
  let threadBuilder = "";
  threadBuilder =
    content +
    "\n ~ " +
    sender +
    "\n" +
    `\n\n-------------------${message.created_at}\n\n`;
  threadBuilder = threadBuilder + message.content + "\n\n";
  const { data: new_message, error: new_message_error } = await getSupabase(session.access_token)
    .from("message")
    .insert([
      { receiver: message.sender, sender, content: threadBuilder },
    ]);
};

export const deleteMessages = async (ids, session) => {
  const listOfIds = ids.split(",");
  const { data, error } = await getSupabase(session.access_token)
    .from('message')
    .delete()
    .in('id', listOfIds)
  errorHandler(error)
}

export const sendMessage = async (receiver, sender, content, session) => {
  const { data, error } = await getSupabase(session.access_token)
  .from('message')
  .insert([
    { receiver, 
      sender, 
      content: content + '\n ~ ' + sender + '\n'
    },
  ])
  errorHandler(error)
}
