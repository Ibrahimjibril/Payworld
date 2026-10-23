import { tokenByAddress, TOKENS } from "@/lib/tokens";
import { rpcCall, TRANSFER_TOPIC, SYSTEM_LEDGER, USDC_ADDRESS } from "@/lib/arc";

export type Incoming = { hash: string; logIndex: number; sender: string; amount: number; ts: number; symbol: string };

const cache = new Map<string, { at: number; data: Incoming[] }>();

const hex = (n: number) => "0x" + n.toString(16);
const addrOf = (t: string) => "0x" + t.slice(26).toLowerCase();

// Incoming token transfers to a wallet, read straight from Arc RPC logs.
// Looks back ARC_LOOKBACK_BLOCKS blocks (default 50000, roughly 7 hours at ~0.5s blocks).
// For long history, plug in an indexer later.
// force = true skips the short cache (used by the Refresh buttons).
export async function incomingTransfers(wallet: string, force = false): Promise<Incoming[]> {
  const w = String(wallet || "").toLowerCase();
  if (!/^0x[0-9a-f]{40}$/.test(w)) return [];
  const hit = cache.get(w);
  if (!force && hit && Date.now() - hit.at < 45000) return hit.data;
  try {
    const latest = parseInt(await rpcCall("eth_blockNumber", []), 16);
    const span = Number(process.env.ARC_LOOKBACK_BLOCKS || 50000);
    const CHUNK = 10000;
    const start = Math.max(0, latest - span);
    const ranges: [number, number][] = [];
    for (let s = start; s <= latest; s += CHUNK) ranges.push([s, Math.min(s + CHUNK - 1, latest)]);

    const toTopic = "0x" + w.slice(2).padStart(64, "0");
    const addresses = [...TOKENS.map((t) => t.address), SYSTEM_LEDGER];
    const batches = await Promise.all(
      ranges.map(([a, b]) =>
        rpcCall("eth_getLogs", [
          { fromBlock: hex(a), toBlock: hex(b), address: addresses, topics: [TRANSFER_TOPIC, null, toTopic] },
        ]).catch(() => [] as any[])
      )
    );
    const logs: any[] = batches.flat().filter((l) => l?.topics?.length >= 3);

    // An ERC-20 USDC transfer also emits a system-ledger log (18 decimals). Skip that duplicate.
    const erc20Keys = new Set(
      logs
        .filter((l) => String(l.address).toLowerCase() === USDC_ADDRESS.toLowerCase())
        .map((l) => `${String(l.transactionHash).toLowerCase()}:${addrOf(l.topics[1])}`)
    );

    const rows: { hash: string; logIndex: number; sender: string; amount: number; block: number; symbol: string }[] = [];
    for (const l of logs) {
      const emitter = String(l.address).toLowerCase();
      const hash = String(l.transactionHash).toLowerCase();
      const sender = addrOf(l.topics[1]);
      if (sender === w) continue;
      const raw = BigInt(l.data && l.data !== "0x" ? l.data : "0x0");
      let symbol: string;
      let decimals: number;
      if (emitter === SYSTEM_LEDGER.toLowerCase()) {
        if (erc20Keys.has(`${hash}:${sender}`)) continue;
        symbol = "USDC";
        decimals = 18;
      } else {
        const tk = tokenByAddress(emitter);
        if (!tk) continue;
        symbol = tk.symbol;
        decimals = tk.decimals;
      }
      const amount = Number(raw) / Math.pow(10, decimals);
      if (!(amount > 0)) continue;
      rows.push({ hash, logIndex: parseInt(l.logIndex, 16) || 0, sender, amount, block: parseInt(l.blockNumber, 16), symbol });
    }
    rows.sort((x, y) => y.block - x.block || y.logIndex - x.logIndex);
    const top = rows.slice(0, 50);

    const blocks = Array.from(new Set(top.map((r) => r.block)));
    const times = new Map<number, number>();
    await Promise.all(
      blocks.map(async (b) => {
        try {
          const blk = await rpcCall("eth_getBlockByNumber", [hex(b), false]);
          times.set(b, parseInt(blk.timestamp, 16) * 1000);
        } catch {
          times.set(b, Date.now());
        }
      })
    );

    const out: Incoming[] = top.map((r) => ({
      hash: r.hash,
      logIndex: r.logIndex,
      sender: r.sender,
      amount: r.amount,
      ts: times.get(r.block) ?? Date.now(),
      symbol: r.symbol,
    }));
    cache.set(w, { at: Date.now(), data: out });
    return out;
  } catch {
    return hit?.data ?? [];
  }
}
