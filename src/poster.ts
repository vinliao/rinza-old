import * as R from "remeda";

// TODO: mention, embeds, and all the stuff
export const warpcast =
	(apiKey: string) => async (text: string, parent?: unknown) => {
		const url = "https://api.warpcast.com/v2/casts";
		const headers = {
			accept: "application/json",
			authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		};

		const parentHash = R.pathOr(parent, ["hash"], undefined);
		const body = JSON.stringify({ text, parent: { hash: parentHash } });
		const response = await fetch(url, { method: "POST", headers, body });
		return response.json();
	};

export const neynar =
	(signerUUID: string, apiKey: string) =>
	async (text: string, parent?: unknown) => {
		const url = "https://api.neynar.com/v2/farcaster/cast";
		const headers = { api_key: apiKey, "Content-Type": "application/json" };
		const parentHash = R.pathOr(parent, ["hash"], undefined);
		const body = JSON.stringify({
			signer_uuid: signerUUID,
			text: text,
			parent: parentHash,
		});

		const response = await fetch(url, { method: "POST", headers, body });
		return await response.json();
	};

export const hubble = (hubHTTP: string, signer: string) => {}; // TODO
