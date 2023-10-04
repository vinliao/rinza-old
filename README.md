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

Making Neynar API key: [https://docs.neynar.com/reference/write-to-farcaster-via-neynar](https://docs.neynar.com/reference/write-to-farcaster-via-neynar)

Making valid signer: [https://warpcast.notion.site/Signer-Request-API-Migration-Guide-Public-9e74827f9070442fb6f2a7ffe7226b3c](https://warpcast.notion.site/Signer-Request-API-Migration-Guide-Public-9e74827f9070442fb6f2a7ffe7226b3c)

A Repl to make signer: [https://replit.com/@pixelhack/ButteryGleamingConditions](https://replit.com/@pixelhack/ButteryGleamingConditions)

If you have bots that's running on Warpcast's API, I'll help you migrate to Neynar or Hubble, DM me on Telegram: [t.me/pixelhackxyz](https://t.me/pixelhackxyz)