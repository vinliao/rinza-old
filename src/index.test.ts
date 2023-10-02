import { describe, expect, test } from "bun:test";
import { makeHubFetcher } from "./index.ts";

describe("hubFetcher", () => {
	const hubHTTP = "http://nemes.farcaster.xyz:2281";
	const fid = 347;
	const hash = "0x01a768f20f3c59018c9119f649d5132638f5ee96";
	// const hubHTTP = "http://20eef7.hubs.neynar.com:2281";
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
