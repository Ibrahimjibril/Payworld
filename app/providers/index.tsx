"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PrivyProvider } from "@privy-io/react-auth";
import { defineChain } from "viem";
import { I18nProvider } from "@/lib/i18n";
import PasskeyProvider from "@/app/components/PasskeyProvider";

// Arc mainnet (Circle). Gas is paid in USDC (18 decimals natively, 6 via the ERC-20 interface).
const arcChain: any = defineChain({
  id: 5042,
  name: "Arc",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.mainnet.arc.io"] } },
  blockExplorers: { default: { name: "Arc Explorer", url: "https://explorer.arc.io" } },
});

const config: any = {
  loginMethods: ["email", "google"],
  embeddedWallets: {
    createOnLogin: "users-without-wallets",
    ethereum: { createOnLogin: "users-without-wallets" },
  },
  appearance: { theme: "dark", accentColor: "#3B82F6" },
  defaultChain: arcChain,
  supportedChains: [arcChain],
};

// Turns normal <a href="/..."> clicks into instant client-side navigation (no full page reload).
function FastLinks() {
  const router = useRouter();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//") || a.target === "_blank" || a.hasAttribute("download")) return;
      e.preventDefault();
      router.push(href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!} config={config}>
      <I18nProvider>
        <FastLinks />
        <PasskeyProvider>{children}</PasskeyProvider>
      </I18nProvider>
    </PrivyProvider>
  );
}
