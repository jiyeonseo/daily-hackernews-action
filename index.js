const core = require("@actions/core");

const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const token = core.getInput("telegram_key");
const bot = new TelegramBot(token);
const chatId = core.getInput("chat_id");

const size = core.getInput("count");

if (size > 500) {
  core.setFailed(
    "More than 500 stories are not allowed. Set a smaller number of stories count."
  );
}

//top stories
const hackernewsURL =
  "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty";

// most @actions toolkit packages have async methods
async function run() {
  const temp = [];
  let msg = "";
  const adding_content = obj => {
    temp.push(obj);
    msg += `[${temp.length}] ${obj.title} \n* link : ${obj.link} \n* see details : ${obj.detail} \n\n`;

    if (temp.length == size) {
      try {
        bot.sendMessage(chatId, msg);
        core.setOutput("Top 5 stories on Hacker news were sent");
      } catch (error) {
        core.setFailed(error);
      }
    }
  };
  axios
    .get(hackernewsURL)
    .then(function(response) {
      response.data.slice(0, size).map(rs => {
        axios
          .get(
            `https://hacker-news.firebaseio.com/v0/item/${rs}.json?print=pretty`
          )
          .then(rs_response => {
            adding_content({
              title: rs_response.data.title,
              link: rs_response.data.url,
              detail: `https://news.ycombinator.com/item?id=${rs}`
            });
          });
      });
    })
    .catch(function(error) {
      core.setFailed(error);
    });
}

run();
