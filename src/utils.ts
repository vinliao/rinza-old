import { appendFile } from "node:fs";

export const clog = (where: string, data: unknown): void => {
	const stringify = (data: unknown): string => {
		if (data instanceof Map)
			return JSON.stringify(Array.from(data.entries()), null, 2);
		if (typeof data === "object") return JSON.stringify(data, null, 2);
		return String(data);
	};

	const timestamp = new Date().toISOString();
	const log = `${timestamp} - ${where} - ${stringify(data)}\n`;
	appendFile("./app.log", log, (err) => {
		console.log(err);
	});
};

export const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));
