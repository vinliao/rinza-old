import { z } from "zod";
import * as R from "remeda";
import { clog } from "./utils";

// =====================================================================================
// schemas
// =====================================================================================

type CastByIdType = z.infer<typeof CastByIdSchema>;
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

type InternalCastType = z.infer<typeof InternalCastSchema>;
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

type ContextType = {
	casts: InternalCastType[];
	reply: (text: string) => Promise<void>;
};
type PosterType = (text: string, cast: InternalCastType) => Promise<void>;

// =====================================================================================
// posters
// =====================================================================================

export const warpcast =
	(apiKey: string) => async (text: string, parent?: unknown) => {
		const url = "https://api.warpcast.com/v2/casts";
		const headers = {
			accept: "application/json",
			authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		};

		const body = JSON.stringify({ text, parent: { hash: parent?.hash } });
		const response = await fetch(url, { method: "POST", headers, body });
		return response.json();
	};

export const neynar =
	(signerUUID: string, apiKey: string) =>
	async (text: string, parent?: unknown) => {
		const url = "https://api.neynar.com/v2/farcaster/cast";
		const headers = { api_key: apiKey, "Content-Type": "application/json" };
		const body = JSON.stringify({
			signer_uuid: signerUUID,
			text: text,
			parent: parent?.hash,
		});

		const response = await fetch(url, { method: "POST", headers, body });
		return await response.json();
	};

export const hubble = (hubHTTP: string, signer: string) => {}; // TODO

// =====================================================================================
// fetcher
// =====================================================================================

// wrapper around Hubble's HTTP API:
// https://www.thehubble.xyz/docs/httpapi/httpapi.html
export const makeHubFetcher = (hubHTTP: string) => {
	type PageOptionType = {
		pageSize?: number;
		pageToken?: string;
		reverse?: boolean;
	};

	const fetchHub = async (
		endpoint: string,
		params: Record<string, string | number | boolean>,
	) => {
		const toSnakeCase = (str: string) =>
			str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
		const url = new URL(`${hubHTTP}/v1/${endpoint}`);
		Object.keys(params).forEach((key) =>
			url.searchParams.append(toSnakeCase(key), String(params[key])),
		);
		clog("fetchHub/url", url);
		return await fetch(url).then((res) => res.json());
	};

	const castById = async (fid: number, hash: string) =>
		fetchHub("castById", { fid, hash });

	const ancestorsById = async (
		fid: number,
		hash: string,
		cArray: CastByIdType[] = [],
	): Promise<CastByIdType[]> => {
		const cast = await castById(fid, hash);
		cArray.push(cast);

		if (!cast.data.castAddBody.parentCastId) return cArray;
		const parentHash = cast.data.castAddBody.parentCastId.hash;
		const parentFid = cast.data.castAddBody.parentCastId.fid;

		return ancestorsById(parentFid, parentHash, cArray);
	};

	const userDataByFid = (fid: number, userDataType: number) =>
		fetchHub("userDataByFid", { fid, userDataType });
	const usernameByFid = (fid: number) => userDataByFid(fid, 6);

	return {
		castById, // defined above to make fetchAncestors work
		ancestorsById,
		dbStats: () => fetchHub("info", { dbStats: 1 }),

		castsByFid: (fid: number, option?: PageOptionType) =>
			fetchHub("castsByFid", { fid, ...option }),

		castsByParent: (fid: number, hash: string, pageOption?: PageOptionType) =>
			fetchHub("castsByParent", { fid, hash, ...pageOption }),

		castsByParentUrl: (url: string, pageOption?: PageOptionType) =>
			fetchHub("castsByParent", { url, ...pageOption }),

		castsByMention: (fid: number, pageOption?: PageOptionType) =>
			fetchHub("castsByMention", { fid, ...pageOption }),

		reactionById: (
			fid: number,
			targetFid: number,
			targetHash: string,
			reactionType: string | number,
		) =>
			fetchHub("reactionById", {
				fid,
				targetFid,
				targetHash,
				reactionType,
			}),

		reactionsByFid: (
			fid: number,
			reactionType: string | number,
			pageOption?: PageOptionType,
		) => fetchHub("reactionsByFid", { fid, reactionType, ...pageOption }),

		reactionsByCast: (
			targetFid: number,
			targetHash: string,
			reactionType: string | number,
			pageOption?: PageOptionType,
		) =>
			fetchHub("reactionsByCast", {
				targetFid,
				targetHash,
				reactionType,
				...pageOption,
			}),

		linkById: (fid: number, targetFid: number, linkType: string) =>
			fetchHub("linkById", { fid, targetFid, linkType }),

		linksByFid: (fid: number, linkType: string, pageOption: PageOptionType) =>
			fetchHub("linksByFid", { fid, linkType, ...pageOption }),

		linksByTargetFid: (
			targetFid: number,
			linkType: string,
			pageOption: PageOptionType,
		) => fetchHub("linksByTargetFid", { targetFid, linkType, ...pageOption }),

		userDataByFid,
		usernameByFid,

		storageLimitsByFid: (fid: number) =>
			fetchHub("storageLimitsByFid", { fid }),

		userNameProofByName: (name: string) =>
			fetchHub("userNameProofByName", { name }),

		userNameProofsByFid: (fid: number) =>
			fetchHub("userNameProofsByFid", { fid }),

		verificationsByFid: (
			fid: number,
			address: string,
			pageOption: PageOptionType,
		) => fetchHub("verificationsByFid", { fid, address, ...pageOption }),

		onChainSignersByFid: (fid: number, signer: string) =>
			fetchHub("onChainSignersByFid", { fid, signer }),

		onChainEventsByFid: (fid: number, eventType: number) =>
			fetchHub("onChainEventsByFid", { fid, eventType }),

		onChainIdRegistryEventByAddress: (address: string) =>
			fetchHub("onChainIdRegistryEventByAddress", { address }),

		eventById: (eventId: number) => fetchHub("eventById", { eventId }),
		// events: (fromEventId) => fetchHub("events", { fromEventId }),
		// submitMessage: () => fetchHub("submitMessage", {})
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

const sortByTimestamp = (cs: any[]) => {
	cs.sort((a, b) => a.timestamp - b.timestamp);
	return cs.reverse();
};

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

// =====================================================================================
// polling
// =====================================================================================

/**
 * Listen to long-polling server
 *
 * Read more: https://grammy.dev/guide/deployment-types
 *
 * @param fid fid to listen to, fid -1 means listen to all casts
 * @param poster poster function, for replying
 * @param handler handler function, for handling incoming casts
 */
const listenCast = async (
	fid: number,
	poster: PosterType,
	handler = (ctx: ContextType) => clog("listenCast/handler", ctx),
) => {
	const pollerUrl = "https://fc-long-poller-production.up.railway.app";
	const url =
		fid === -1 // fid -1 means listen to all casts
			? `${pollerUrl}/all-cast`
			: `${pollerUrl}/notifications?fid=${fid}`;

	clog("listenCast/url", url);

	while (true) {
		try {
			const notification = await fetch(url).then((res) => res.json());
			const parsed = CastIdSchema.parse(notification);
			clog("startPolling/notification", notification);
			if (!notification) continue;
			if (notification?.message === "timeout") continue;
			handler(await processCast(parsed, poster));
		} catch (e) {
			console.log(e);
		}
	}
};

const processCast = async (
	notification: CastId,
	poster: PosterType,
	mode = "cast",
) => {
	const hubHTTP = "http://nemes.farcaster.xyz:2281";
	const hubFetcher = makeHubFetcher(hubHTTP);

	let tmp = [await hubFetcher.castById(notification.fid, notification.hash)];
	if (mode === "thread") {
		const ancestors = await hubFetcher.ancestorsById(
			notification.fid,
			notification.hash,
		);
		tmp = [...ancestors, ...tmp];
	}

	const extracted = R.pipe(
		tmp,
		R.map(extractCastById),
		R.uniqBy((c) => c.hash),
		R.sortBy((c) => c.timestamp),
		R.reverse(),
	);

	clog("processCast/extracted", extracted);

	const fids = R.pipe(
		extracted,
		R.map((c) => [c.fid, ...c.mentions]),
		R.flatten(),
		R.uniq(),
	);
	const usernames = await Promise.all(R.map(fids, hubFetcher.usernameByFid));
	const fidUsernameMap = new Map(usernames.map((u) => [u.fid, u.username]));

	clog("processCast/fids", fids);
	clog("processCast/fidUsernameMap", fidUsernameMap);

	const casts = sortByTimestamp(
		R.pipe(
			extracted,
			R.map((c) => addUsername(c, fidUsernameMap)),
			R.map((c) => embedMentions(c, fidUsernameMap)),
			R.map(deleteMentions),
			R.map(transformTimestmap),
			R.map(InternalCastSchema.parse),
		),
	);

	return {
		casts,
		reply: async (text: string) => await poster(text, casts[0]),
	};
};

export const makeBot = (poster: PosterType) => {
	const handlers = new Map<number, (ctx: ContextType) => void>();
	const listen = (fid: number, handler: (ctx: ContextType) => void) => {
		clog("makeBot/listen", `fid: ${fid}; handler: ${handler}`);
		handlers.set(fid, handler);
	};

	const start = async () => {
		handlers.forEach((handler, fid) => {
			listenCast(fid, poster, handler);
		});
	};

	return {
		listen,
		start,
	};
};

// const signerUUID = z.string().parse(process.env.NEYNAR_PICTURE_SIGNER_UUID);
// const apiKey = z.string().parse(process.env.NEYNAR_API_KEY);
// const neynarPoster = neynar(signerUUID, apiKey);
// const bot = makeBot(neynarPoster);

// bot.listen(4640, async (ctx) => {
// 	clog("bot.listen/4640", ctx);
// 	if (ctx.casts[0].fid === 4286) ctx.reply("bot.listen/echo4640.4286");
// 	ctx.reply("echo!");
// });

// bot.listen(-1, async (ctx) => {
// 	clog("bot.listen/all", ctx);
// });

// bot.start();
