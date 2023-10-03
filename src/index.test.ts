import { describe, expect, test } from "bun:test";
import { extractCastById, getCtx, makeHubFetcher, neynar } from "./index.ts";
import { z } from "zod";
import * as R from "remeda";

describe("hubFetcher", () => {
	const fid = 4640;
	const hash = "0x5373f293112dc8ae7d205cfba619db3ca3152d0f";
	const hubHTTP = "https://20eef7.hubs.neynar.com:2281";
	const fetcher = makeHubFetcher(hubHTTP);

	test("dbStats()", async () => {
		const data = await fetcher.dbStats();
		expect(data.peerId).toBeString();
	});

	test("castById()", async () => {
		const data = await fetcher.castById(fid, hash);
		expect(data.hash).toBe(hash);
	});

	test("ancestorsById()", async () => {
		const data = await fetcher.ancestorsById(fid, hash);
		expect(data).toBeArray();
		data.forEach((a) => expect(a.hash).toBeString());
	});

	test("usernameByFid()", async () => {
		const data = await fetcher.usernameByFid(1);
		expect(data.fid).toBeNumber();
		expect(data.username).toBe("farcaster");
	});
});

describe("getCtx", () => {
	const castId = {
		fid: 4640,
		hash: "0x5373f293112dc8ae7d205cfba619db3ca3152d0f",
	};
	const hubHTTP = "https://20eef7.hubs.neynar.com:2281";
	const fetcher = makeHubFetcher(hubHTTP);
	const signerUUID = z.string().parse(process.env.NEYNAR_PICTURE_SIGNER_UUID);
	const apiKey = z.string().parse(process.env.NEYNAR_API_KEY);
	const client = neynar(signerUUID, apiKey);
	const botSettings = {
		hubFetcher: fetcher,
		poster: client.cast,
	};

	test("poster()", async () => {
		const data = await client.cast(`testing ${Math.random()}`);
		expect(data).toBeDefined();
		client.remove(data.cast.hash);
	});

	test("getCtx().reply()", async () => {
		const ctx = await getCtx(castId, botSettings);
		expect(ctx.casts[0].hash).toBe(castId.hash);
		const text = `testing ${Math.random()}`;
		const reply = await client.cast(text, ctx.casts[0]);
		const replyHash = z.string().parse(reply.cast.hash);
		const replyFid = z.number().parse(reply.cast.author.fid);

		const fetchedReply = R.pipe(
			await fetcher.castById(replyFid, replyHash),
			extractCastById,
		);

		expect(fetchedReply.parentHash).toBe(ctx.casts[0].hash);
		expect(fetchedReply.text).toBe(text);
		client.remove(replyHash);
	});

	test("getCtx() returnsThread=true", async () => {
		const ctx = await getCtx(castId, { ...botSettings, returnsThread: true });
		expect(ctx.casts[0].hash).toBe(castId.hash);
		for (let i = 0; i < ctx.casts.length - 1; i++) {
			expect(ctx.casts[i].parentHash).toBe(ctx.casts[i + 1].hash);
		}

		expect(ctx.reply).toBeFunction();
	});
});
