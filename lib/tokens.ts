export type Token = { symbol: string; name: string; sub: string; address: string; decimals: number };

// Arc mainnet ERC-20 interfaces. Both use 6 decimals.
export const TOKENS: Token[] = [
  { symbol: "USDC", name: "USD Coin", sub: "Native USDC on Arc", address: "0x3600000000000000000000000000000000000000", decimals: 6 },
  { symbol: "EURC", name: "Euro Coin", sub: "EURC on Arc", address: "0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1", decimals: 6 },
];

export const DEFAULT_TOKEN = "USDC";
export const tokenBySymbol = (s?: string | null) => TOKENS.find((t) => t.symbol === s) || null;
export const tokenByAddress = (a?: string | null) =>
  TOKENS.find((t) => t.address.toLowerCase() === String(a || "").toLowerCase()) || null;
export const symbolOf = (a?: string | null) => tokenByAddress(a)?.symbol || "USD";
