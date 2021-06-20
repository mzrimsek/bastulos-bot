# Bastulos Bot

A bot to interact with Twitch, Discord, and anything else your mind (and my freetime) can imagine.

## Commands

### Admin (only work when triggered from Twitch chat)

- !active - toggles whether commands work or not
- !add <command> <message> - adds a command (or edits the existing command) with the specified message
- !rm <command> - removes the specified command

### Mod (only work when triggered from Twitch chat)

- !reset - reset face cam and mic changes back to default
- !addw <word/phrase> - adds a word/phrase to be tracked
- !rmw <word/phrase> - removes a word/phrase from being tracked
- !incw <word/phrase> <number:optional> - increments the word/phrase count. Optional number parameter sets the amount to increment by
- !clrw <word/phrase> - resets the word/phrase count back to 0

### General (work when triggered from both Twitch chat and Discord)

- !help - displays help command (this shows different commands based on where it is triggered from)
- Any of the commands added with the !add command are accessible in both locations

### General Twitch Only

- !wordcount <word/phrase> - gets the tracked count of a word/phrase
- !lightsoff - turns off the lights in stream room
- !lightson - turns on the lights in stream room
- !lights <color_name/R G B> - sets color of lights in stream room
  - color_name must be a [valid CSS3 color name](https://www.w3.org/wiki/CSS/Properties/color/keywords)
    - ex: !lightscol red
  - RGB value must be 3 numbers between 0 and 255
    - ex: !lightscol 255 0 0
- !lightsr - sets color of lights in stream room to random color

### OBS (only work when triggered from Twitch chat)

- !cam - toggles face cam visibility
- !mic - toggles desktop mic active
- !color <number:optional> - changes face cam color overlay color. Optional number parameter causes color to change that many times in 1 second (max 1000)
- !aqua - toggle Aqua visibility on scenes with her in them

## Twitch Authentication

Authentication is done using the [Twitch OAuth Authorization Code Flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth#oauth-authorization-code-flow).

[This basic walkthrough](https://d-fischer.github.io/twitch-chat-client/docs/examples/basic-bot.html) explains the process, as well as how to get refreshing tokens obtained for the twitch-chat-client library. Currently tokens are just stored in a JSON file which is read from/written to when obtaining and refreshing access tokens.
For local development the `botTokens.json` file is read in using the `TWITCH_BOT_TOKENS_FILE_LOCATION` environment variable and the `channelTokens.json` file is read in using the `TWITCH_CHANNEL_TOKENS_FILE_LOCATION` environment variable. When running from Docker, a directory containing the `botTokens.json` and `channelTokens.json` files must be mounted as a volume to the `/var/bot` directory.

## Invite to Discord Server

https://discord.com/api/oauth2/authorize?client_id=772707347520946197&permissions=0&scope=bot
