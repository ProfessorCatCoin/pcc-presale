"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";

declare global {
  interface Window {
    solana?: any;
  }
}

export function PresaleSection() {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  async function handleBuy() {
    if (amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      // 1. Connect wallet
      if (!window.solana) {
        throw new Error("Please install Phantom wallet from https://phantom.app/");
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      setWalletAddress(address);

      // 2. Show success message
      alert(`✅ Wallet connected: ${address.slice(0, 8)}...\n\n📝 Next steps:\n1. Deploy Anchor program\n2. Add PROGRAM_ID\n3. Replace this alert with real transaction`);

    } catch (error: any) {
      console.error("Error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold md:text-5xl">
            Join the Presale
          </h2>
          <div className="mx-auto mb-6 h-1 w-32 rounded-full bg-accent" />
          <p className="mb-12 text-pretty text-lg text-muted-foreground">
            Buy PCC tokens with Soluna. Tokens are sent automatically.
          </p>

          <Card className="border-2 border-accent/20 bg-card p-8 shadow-xl md:p-12">
            <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-accent/10 p-4 text-accent">
              <Edit className="h-5 w-5" />
              <p className="font-medium">Soluna Presale</p>
            </div>

            {walletAddress && (
              <div className="mb-6 rounded-lg bg-green-500/10 p-4 text-green-400">
                ✅ Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <p className="mb-2 text-left text-sm font-medium">Amount of PCC</p>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  className="h-12 text-center text-lg"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  1 SOLUNA = 100 PCC
                </p>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">You will pay:</p>
                <p className="text-xl font-bold">{(amount / 100).toFixed(2)} SOLUNA</p>
              </div>

              <Button
                size="lg"
                className="w-full text-lg"
                disabled={loading || amount <= 0}
                onClick={handleBuy}
              >
                {loading ? "🔄 Processing..." : "🚀 Buy PCC Tokens"}
              </Button>

              <p className="text-xs text-muted-foreground">
                {!walletAddress 
                  ? "Connect wallet to start" 
                  : "Ready! Deploy smart contract to enable real purchases"}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
