// Arc mainnet (Circle). Chain ID 5042. Gas is paid in USDC.
// Native USDC uses 18 decimals; the ERC-20 interface at USDC_ADDRESS uses 6 decimals.
export const ARC = {
  chainId: 5042,
  rpcUrl: process.env.ARC_RPC_URL || "https://rpc.mainnet.arc.io",
  explorer: process.env.ARC_EXPLORER_URL || "https://explorer.arc.io",
};

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
export const EURC_ADDRESS = "0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1";
// System emitter that logs every native USDC movement with 18 decimals (EIP-7708).
export const SYSTEM_LEDGER = "0xfffffffffffffffffffffffffffffffffffffffe";

export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// Kept for compatibility with code that used TOKENS from the old tempo.ts
export const TOKENS = [{ symbol: "USDC", address: USDC_ADDRESS, decimals: 6 }];

// Native (18 decimals) -> ERC-20 style (6 decimals)
export const nativeToUsdc = (wei: bigint) => wei / BigInt(10) ** BigInt(12);

export async function rpcCall(method: string, params: any[], timeoutMs = 8000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(ARC.rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      cache: "no-store",
      signal: ctrl.signal,
    });
    const j = await res.json();
    if (j.error) throw new Error("rpc");
    return j.result;
  } finally {
    clearTimeout(timer);
  }
}

export async function getTokenBalance(token: string, owner: string): Promise<bigint> {
  const data = "0x70a08231" + owner.slice(2).toLowerCase().padStart(64, "0");
  const result = await rpcCall("eth_call", [{ to: token, data }, "latest"]);
  if (typeof result !== "string") throw new Error("rpc");
  return BigInt(result === "0x" ? "0x0" : result);
}

export function formatUnits(v: bigint, decimals = 6, places = 2) {
  const base = BigInt(10) ** BigInt(decimals);
  const whole = v / base;
  const frac = (v % base).toString().padStart(decimals, "0").slice(0, places);
  return `${whole.toString()}.${frac}`;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function getReceipt(hash: string): Promise<any | null> {
  try {
    const r = await rpcCall("eth_getTransactionReceipt", [hash]);
    return r ?? null;
  } catch {
    return null;
  }
}

const topicAddr = (t: string) => "0x" + t.slice(26).toLowerCase();

// Matches the ERC-20 Transfer log emitted by the token contract itself (6 decimals).
export function matchesTransfer(receipt: any, token: string, from: string, to: string, amount: bigint) {
  const logs: any[] = Array.isArray(receipt?.logs) ? receipt.logs : [];
  return logs.some(
    (l) =>
      String(l.address).toLowerCase() === token.toLowerCase() &&
      l.topics?.[0] === TRANSFER_TOPIC &&
      l.topics.length >= 3 &&
      topicAddr(l.topics[1]) === from.toLowerCase() &&
      topicAddr(l.topics[2]) === to.toLowerCase() &&
      BigInt(l.data && l.data !== "0x" ? l.data : "0x0") === amount
  );
}

export function findTransfer(receipt: any, token: string, from: string, to: string): bigint | null {
  const logs: any[] = Array.isArray(receipt?.logs) ? receipt.logs : [];
  for (const l of logs) {
    if (
      String(l.address).toLowerCase() === token.toLowerCase() &&
      l.topics?.[0] === TRANSFER_TOPIC &&
      l.topics.length >= 3 &&
      topicAddr(l.topics[1]) === from.toLowerCase() &&
      topicAddr(l.topics[2]) === to.toLowerCase()
    ) {
      return BigInt(l.data && l.data !== "0x" ? l.data : "0x0");
    }
  }
  return null;
}
