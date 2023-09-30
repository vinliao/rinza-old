import { z } from "zod";
import { clog } from "./utils";
import { sleep } from "bun";
import _ from "lodash-es";

// =====================================================================================
// schemas
// =====================================================================================

const CastByIdSchema = z.object({
	data: z.object({
		type: z.string(),
		fid: z.number(),
		timestamp: z.number(),
		network: z.string(),
		castAddBody: z.object({
			embedsDeprecated: z.array(z.string()),
			mentions: z.array(z.number()),
			parentCastId: z.object({ fid: z.number(), hash: z.string() }).nullish(),
			text: z.string(),
			mentionsPositions: z.array(z.number()),
			embeds: z.array(z.object({ url: z.string() })),
		}),
	}),
	hash: z.string(),
	hashScheme: z.string(),
	signature: z.string(),
	signatureScheme: z.string(),
	signer: z.string(),
});

type CastId = z.infer<typeof CastIdSchema>;
const CastIdSchema = z.object({
	fid: z.number(),
	hash: z.string(),
});

const InternalCastSchema = z.object({
	fid: z.number(),
	hash: z.string(),
	parentHash: z.string().nullish(),
	parentFid: z.number().nullish(),
	timestamp: z.number(),
	text: z.string(),
	embeds: z.array(z.object({ url: z.string() })),
	username: z.string(),
});

// =====================================================================================
// fetcher
// =====================================================================================

const makeHubFetcher = (hubHTTP: string) => {
	const fetchCast = async (fid: number, hash: string) => {
		const cleanHash = hash.startsWith("0x") ? hash.slice(2) : hash;
		const url = `${hubHTTP}/v1/castById?hash=${cleanHash}&fid=${fid}`;
		const data = await fetch(url).then((res) => res.json());
		return CastByIdSchema.parse(data);
	};

	const fetchAncestors = async (
		fid: number,
		hash: string,
		cArray: any[] = [],
	): Promise<any[]> => {
		const cast = await fetchCast(fid, hash);
		cArray.push(cast);

		if (!cast.data.castAddBody.parentCastId) return cArray;
		const parentHash = cast.data.castAddBody.parentCastId.hash;
		const parentFid = cast.data.castAddBody.parentCastId.fid;

		return fetchAncestors(parentFid, parentHash, cArray);
	};

	const fetchUsername = async (fid: number) => {
		const url = `${hubHTTP}/v1/userDataByFid?fid=${fid}&user_data_type=6`;
		const data = await fetch(url).then((res) => res.json());
		return {
			fid,
			username: data.data.userDataBody.value,
		};
	};

	return {
		fetchCast,
		fetchAncestors,
		fetchUsername,
	};
};

// =====================================================================================
// pipes
// =====================================================================================

const extractCastById = (c: z.infer<typeof CastByIdSchema>) => ({
	hash: c.hash,
	parentHash: c.data.castAddBody.parentCastId?.hash,
	parentFid: c.data.castAddBody.parentCastId?.fid,
	fid: c.data.fid,
	timestamp: c.data.timestamp,
	text: c.data.castAddBody.text,
	mentions: c.data.castAddBody.mentions,
	mentionsPositions: c.data.castAddBody.mentionsPositions,
	embeds: c.data.castAddBody.embeds,
});

const transformTimestmap = (c: any) => {
	const FARCASTER_EPOCH = 1609459200; // January 1, 2021 UTC
	return {
		...c,
		timestamp: c.timestamp + FARCASTER_EPOCH,
	};
};

const deleteMentions = (c: any) => {
	const { mentions, mentionsPositions, ...rest } = c;
	return rest;
};

const addUsername = (c: any, fidUsernameMap: Map<number, string>) => {
	const username = fidUsernameMap.get(c.fid) || "unknown";
	return {
		...c,
		username,
	};
};

const embedMentions = (c: any, fidUsernameMap: Map<number, string>) => {
	const conds = [
		!c.mentions,
		!c.mentionsPositions,
		c.mentions.length === 0,
		c.mentionsPositions.length === 0,
	];

	if (conds.every(Boolean)) return c;

	let tmp = c.text;
	for (let i = c.mentionsPositions.length - 1; i >= 0; i--) {
		const position = c.mentionsPositions[i];
		const username = fidUsernameMap.get(c.mentions[i]) || "unknown";
		tmp = `${tmp.slice(0, position)}@${username}${tmp.slice(position)}`;
	}
	return { ...c, text: tmp };
};

// long-polling server
// read: https://grammy.dev/guide/deployment-types
const pollNotification = async (
	fid: number,
	handler = (cid: CastId) => clog("pollNotification/handler", cid),
	timeout = 10000,
	isDev = true,
) => {
	const pollerUrl = "https://fc-long-poller-production.up.railway.app";
	const url = isDev
		? `${pollerUrl}/test-ancestor`
		: `${pollerUrl}/notifications?fid=${fid}`;

	while (true) {
		try {
			const notification = await fetch(url).then((res) => res.json());
			const parsed = CastIdSchema.parse(notification);
			clog("startPolling/notification", notification);
			if (!notification) continue;
			if (_.get(notification, "message") === "timeout") continue;
			handler(parsed);
		} catch (e) {
			console.log(e);
		}

		if (isDev) await sleep(timeout);
	}
};
