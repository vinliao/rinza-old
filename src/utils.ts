export const clog = (description: string, data: any): void => {
  const appendFile = async (path: string, data: string) => {
    const file = Bun.file(path);
    const log = (await file.text()) + data + "\n";
    await Bun.write(path, log);
  };

  const now = new Date();
  const timestamp = now.toISOString();
  const log = `${timestamp} - ${description} - ${
    data instanceof Object ? JSON.stringify(data, null, 2) : data
  }\n`;

  console.log(log);
  appendFile("./app.log", log);
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
