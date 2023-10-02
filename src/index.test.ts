import { describe, expect, test } from "bun:test";
import { makeBot, makeHubFetcher, neynar } from "./index.ts";
import { date, z } from "zod";

// describe("hubFetcher", () => {
// 	const hubHTTP = "http://nemes.farcaster.xyz:2281";
// 	const fid = 347;
// 	const hash = "0x01a768f20f3c59018c9119f649d5132638f5ee96";
// 	// const hubHTTP = "http://20eef7.hubs.neynar.com:2281";
// 	const fetcher = makeHubFetcher(hubHTTP);

// 	test("dbStats()", async () => {
// 		const data = await fetcher.dbStats();
// 		expect(data.peerId).toBeString();
// 	});

// 	test("castById()", async () => {
// 		const data = await fetcher.castById(fid, hash);
// 		expect(data.hash).toBe(hash);
// 	});

// 	test("ancestorsById()", async () => {
// 		const data = await fetcher.ancestorsById(fid, hash);
// 		expect(data).toBeArray();
// 		data.forEach((a) => expect(a.hash).toBeString());
// 	});

// 	test("usernameByFid()", async () => {
// 		const data = await fetcher.usernameByFid(1);
// 		expect(data.fid).toBeNumber();
// 		expect(data.username).toBeString();
// 	});
// });

describe("poller", () => {
	const signerUUID = z.string().parse(process.env.NEYNAR_PICTURE_SIGNER_UUID);
	const apiKey = z.string().parse(process.env.NEYNAR_API_KEY);
	const poster = neynar(signerUUID, apiKey);

	// test("bot.listener()", async () => {
	// 	const bot = makeBot(poster);
	// 	bot.listen(4640, (ctx) => {
	// 		expect(ctx.casts).toBeArray();
	//     ctx.reply("ok")
	// 	});

	// 	bot.start();
	// });

	test("poster()", async () => {
		const data = await poster(`testing @picture ${new Date()}`);
		expect(data).toBeDefined();
	});

	// TODO: how do i test this?
});
