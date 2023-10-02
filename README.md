Rinza: a Farcaster bot SDK.

## TLDR

```typescript
const bot = makeBot({
  hubFetcher: makeHubFetcher(hubHTTP),
  poster,
});

// listen to notifications, bot reples "echo!" to each notifications
bot.listen(botFID, (ctx) => {
  console.log(ctx.casts)
  ctx.reply("echo!");
});

// casts the current ETH block height every ten seconds
new Cron("*/10 * * * * *", () => {
  const ethBlockHeight = fetchBlockHeight('eth');
  poster(`Current block height: ${ethBlockHeight}`);
});

bot.start();
```

To get Neynar keys: [https://docs.neynar.com/reference/write-to-farcaster-via-neynar](https://docs.neynar.com/reference/write-to-farcaster-via-neynar)

If you have bots that's running on Warpcast's API, I'll help you migrate to Neynar or Hubble, DM me on Telegram: [t.me/pixelhackxyz](https://t.me/pixelhackxyz)