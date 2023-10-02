Rinza: a Farcaster bot SDK.

## TLDR

```typescript
import { makeBot, makeHubFetcher, neynar } from "rinza";

const hubHTTP = "xxxxxx.hubs.neynar.com:2281";
const botFID = 4640;

const signerUUID = process.env.NEYNAR_PICTURE_SIGNER_UUID;
const apiKey = process.env.NEYNAR_API_KEY;
const bot = makeBot({
  hubFetcher: makeHubFetcher(hubHTTP),
  poster: neynar(signerUUID, apiKey),
});

// listen to notifications, bot reples "echo!" to each notifications
bot.listen(botFID, (ctx) => {
  console.log(ctx.casts) // prints all casts
  ctx.reply("echo!");
});

// casts the current ETH block height every hour
bot.cron('0 * * * *', (ctx) => {
  const ethBlockHeight = fetchBlockHeight('eth');
  ctx.cast(`Current block height: ${ethBlockHeight}`);
}

bot.start();
```

To get Neynar keys: [https://docs.neynar.com/reference/write-to-farcaster-via-neynar](https://docs.neynar.com/reference/write-to-farcaster-via-neynar)

If you have bots that's running on Warpcast's API, I'll help you migrate to Neynar or Hubble, DM me on Telegram: [t.me/pixelhackxyz](https://t.me/pixelhackxyz)