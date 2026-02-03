mport dotenv from "dotenv";
dotenv.config();
import axios from 'axios';
import { Telegraf } from "telegraf";
import { message } from "telegraf/filters"
import cron from "node-cron";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Store subscribed users (for now in memory)
const subscribers = new Set();

async function getQuote() {
  try {
    const res = await axios.get("https://zenquotes.io/api/random");
    return `💡 *${res.data[0].q}*\n\n— _${res.data[0].a}_`;
  } catch (error) {
    return "⚠️ Could not fetch quote right now.";
  }
}


bot.start((ctx) => ctx.reply("🌅 Welcome to Daily Quotes Bot!\n\nCommands:\n/quote\n/subscribe\n/unsubscribe"))
bot.help((ctx) => ctx.reply('We are here to help you out'));
bot.command("pairsum", async (ctx) => {
  let response = await axios.get(
    "https://raw.githubusercontent.com/itssharmajee/DSA-with-Java/refs/heads/main/ArrayList/PairSum.java"
  );
  return ctx.reply(response.data);
});
bot.command("quote", async (ctx) => {
  const quote = await getQuote();
  ctx.replyWithMarkdown(quote);
});
bot.command("subscribe", (ctx) => {
  subscribers.add(ctx.chat.id);
  ctx.reply("✅ You are subscribed to daily quotes!");
});
bot.command("unsubscribe", (ctx) => {
  subscribers.delete(ctx.chat.id);
  console.log(ctx.chat);
  
  ctx.reply("❌ You are unsubscribed.");
});
cron.schedule("56 11 * * *", async () => {
  const quote = await getQuote();

  subscribers.forEach((chatId) => {
    bot.telegram.sendMessage(chatId, quote, {
      parse_mode: "Markdown",
    });
  });
});

bot.on(message('sticker'), (ctx) => ctx.reply('👍'))

bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch();
console.log("🤖 Daily Quotes Bot is running...");
