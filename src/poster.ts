import { z } from "zod";

export const warpcast = (apiKey: string) => {
  const sendCast = async (text: string, parent?: any) => {
    const url = "https://api.warpcast.com/v2/casts";
    const headers = {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    const parentCastId = parent
      ? {
          hash: z.string().parse(parent.hash),
          fid: z.number().parse(parent.fid),
        }
      : undefined;

    const body = JSON.stringify({
      text,
      parent: parentCastId,
    });

    const response = await fetch(url, { method: "POST", headers, body });
    return response.json();
  };
};

export const neynar = (signerUUID: string, apiKey: string) => {
  const sendCast = async (text: string, parent?: any) => {
    const url = `https://api.neynar.com/v2/farcaster/cast`;
    const headers = {
      api_key: apiKey,
      "Content-Type": "application/json",
    };

    const body = JSON.stringify({
      signer_uuid: signerUUID,
      text: text,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    return await response.json();
  };
};

export const hubble = (hubHTTP: string, signer: string) => {}; // TODO
