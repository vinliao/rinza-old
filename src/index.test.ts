import { describe, expect, test, mock } from "bun:test";
import { getCtx, makeBot, makeHubFetcher, neynar } from "./index.ts";
import { z } from "zod";

describe("hubFetcher", () => {
	const fid = 347;
	const hash = "0x01a768f20f3c59018c9119f649d5132638f5ee96";
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
		expect(data.username).toBeString();
	});
});

describe("poller", () => {
	const castId = {
		fid: 347,
		hash: "0x01a768f20f3c59018c9119f649d5132638f5ee96",
	};
	const hubHTTP = "https://20eef7.hubs.neynar.com:2281";
	const fetcher = makeHubFetcher(hubHTTP);
	const signerUUID = z.string().parse(process.env.NEYNAR_PICTURE_SIGNER_UUID);
	const apiKey = z.string().parse(process.env.NEYNAR_API_KEY);
	const poster = neynar(signerUUID, apiKey);
	const botSettings = {
		hubFetcher: fetcher,
		poster,
	};

	test("poster()", async () => {
		const data = await poster(`testing ${Math.random()}`);
		expect(data).toBeDefined();
	});

	test("getCtx()", async () => {
		const ctx = await getCtx(castId, botSettings);
		expect(ctx.casts[0].hash).toBe(castId.hash);
		expect(ctx.reply).toBeFunction();
	});

	test("getCtx() returnsThread", async () => {
		const ctx = await getCtx(castId, { ...botSettings, returnsThread: true });
		expect(ctx.casts[0].hash).toBe(castId.hash);
		for (let i = 0; i < ctx.casts.length - 1; i++) {
			expect(ctx.casts[i].parentHash).toBe(ctx.casts[i + 1].hash);
		}

		expect(ctx.reply).toBeFunction();
	});
});

// TODO cleanup: remove all new cast created in the last minute or something