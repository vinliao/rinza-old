import { z } from "zod";
import { clog } from "./utils.ts";
import { blake3 } from "@noble/hashes/blake3";
import * as ed from "@noble/ed25519";


type CastIdType = z.infer<typeof CastIdSchema>;
const CastIdSchema = z.object({
	fid: z.number(),
	hash: z.string(),
});

const makeCastAddBody = (text: string, parentCastId?: CastIdType) => ({
	text: text,
	parentCastId: parentCastId ? parentCastId : undefined,
	mentions: [],
	mentionsPositions: [],
	embeds: [],
});

const baseMessage = {
	type: 0,
	fid: 0,
	timestamp: 0,
	network: 0,
	castAddBody: undefined,
	castRemoveBody: undefined,
	reactionBody: undefined,
	verificationAddEthAddressBody: undefined,
	verificationRemoveBody: undefined,
	userDataBody: undefined,
	linkBody: undefined,
	usernameProofBody: undefined,
};

const myMessage = {
	...baseMessage,
	type: 1,
	fid: 1010,
	timestamp: 2,
	castAddBody: makeCastAddBody("hello", { fid: 3, hash: "hash" }),
};

const privKeyHex = z.string().parse(process.env.HUB_PICTURE_SIGNER_PRIVATE_KEY);
const privKey = ed.etc.hexToBytes(privKeyHex);
const message = Uint8Array.from([0xab, 0xbc, 0xcd, 0xde]);
const signature = await ed.signAsync(message, privKey);
clog("pg/signature", signature);