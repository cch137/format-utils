import readStream from "../read-stream/index.js";

export default async function fetch2(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  const res = await fetch(input, init);
  const contentType = res.headers.get("content-type");
  if (!contentType) return res;
  const match = contentType.match(/charset=([^;]+)/i);
  if (!match || match[1] === "utf-8") return res;
  res.text = async () =>
    new TextDecoder(match[1]).decode(await readStream(res.body));
  res.json = async () => JSON.parse(await res.text());
  return res;
}
