Rinza: a Farcaster bot SDK.

Installation: `npm install rinza`

## TLDR

```typescript
import { neynar, makeBot, makeHubFetcher } from "rinza";

const client = neynar(signerUUID, apiKey);
const bot = makeBot({
  hubFetcher: makeHubFetcher(hubHTTP),
  castFn: client.cast,
});

// listen to notifications, bot reples "echo!" to each notifications
bot.listen(botFID, (ctx) => {
  console.log(ctx.casts)
  ctx.reply("echo!");
});

// listen to all cast in the network, then log to console
bot.listen(-1, (ctx) => {
  console.log(ctx.casts)
});

// casts the current ETH block height every ten seconds
new Cron("*/10 * * * * *", () => {
  const ethBlockHeight = fetchBlockHeight('eth');
  poster(`Current block height: ${ethBlockHeight}`);
});

bot.start();
```

To get Neynar API key: [https://neynar.com](https://neynar.com)

If you have bots that's running on Warpcast's API, I'll help you migrate to Neynar or Hubble, DM me on Telegram: [t.me/pixelhackxyz](https://t.me/pixelhackxyz)