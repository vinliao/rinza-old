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

// =====================================================================================
// messages and protos
// =====================================================================================

// literally replicate this
// describe("makeCastAdd", () => {
//   test("succeeds", async () => {
//     const message = await builders.makeCastAdd(
//       protobufs.CastAddBody.create({
//         text: faker.random.alphaNumeric(200),
//         mentions: [Factories.Fid.build(), Factories.Fid.build()],
//         mentionsPositions: [10, 20],
//         parentCastId: { fid: Factories.Fid.build(), hash: Factories.MessageHash.build() },
//         embeds: [{ url: faker.internet.url() }, { castId: Factories.CastId.build() }],
//       }),
//       { fid, network },
//       ed25519Signer,
//     );
//     expect(message.isOk()).toBeTruthy();
//     const isValid = await validations.validateMessage(message._unsafeUnwrap());
//     expect(isValid.isOk()).toBeTruthy();
//   });
// });

// const makeMessage = async (messageData: any, signer: any) => {
// 	const dataBytes = protobufs.MessageData.encode(messageData).finish();

// 	const hash = blake3(dataBytes, { dkLen: 20 });

// 	const signature = await signer.signMessageHash(hash);
// 	if (signature.isErr()) return err(signature.error);

// 	const signerKey = await signer.getSignerKey();
// 	if (signerKey.isErr()) return err(signerKey.error);

// 	const message = protobufs.Message.create({
// 		data: messageData,
// 		hash,
// 		hashScheme: protobufs.HashScheme.BLAKE3,
// 		signature: signature.value,
// 		signatureScheme: signer.scheme,
// 		signer: signerKey.value,
// 	});

// 	return ok(message as TMessage);
// };

// const makeCastAddBody = (text: string, parentCastId?: CastIdType) => ({
// 	text: text,
// 	parentCastId: parentCastId ? parentCastId : undefined,
// 	mentions: [],
// 	mentionsPositions: [],
// 	embeds: [],
// });

// const baseMessage = {
// 	type: 0,
// 	fid: 0,
// 	timestamp: 0,
// 	network: 0,
// 	castAddBody: undefined,
// 	castRemoveBody: undefined,
// 	reactionBody: undefined,
// 	verificationAddEthAddressBody: undefined,
// 	verificationRemoveBody: undefined,
// 	userDataBody: undefined,
// 	linkBody: undefined,
// 	usernameProofBody: undefined,
// };

// const myMessage = {
// 	...baseMessage,
// 	fid: 1,
// 	timestamp: 2,
// 	castAddBody: makeCastAddBody("hello", undefined),
// };
