import { z } from "zod";
import { warpcast, neynar } from "./poster";
import { clog } from "./utils";
import _ from "lodash-es";

// clog("pg/clogfn", () => "test");
// clog("pg/clogstring", "test");
// clog("pg/clogarr", [1, 2, 3]);
// clog("pg/clogobj", { a: 1, b: 2, c: 3 });

// const parsed = z.function().parse(() => "test");
// clog(parsed.toString(), parsed());
// clog("pg/parsed", parsed());
// console.log(parsed.toString());

const cast = { hash: "0x2d3310c3785b0564d9ddeabed6e9b8cedbf14545" };
// const k1 = z.string().parse(process.env.WARPCAST_PICTURE_API_KEY);
// clog("pg/warpcast", await warpcast(k1)(`test${Date.now()}`, cast));

const k2UUID = z.string().parse(process.env.NEYNAR_PICTURE_SIGNER_UUID);
const k2API = z.string().parse(process.env.NEYNAR_API_KEY);
clog("pg/neynar", await neynar(k2UUID, k2API)(`test${Date.now()}`));

// const a = { a: 1, b: 2, c: 3 };
// clog("pg", _.get(a, "d"));
