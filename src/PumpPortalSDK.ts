import WebSocket from 'ws';
import fetch from 'node-fetch';
import { VersionedTransaction } from '@solana/web3.js';

// Define subscription events
type PumpPortalEvent =
  | 'subscribeNewToken'
  | 'subscribeTokenTrade'
  | 'subscribeAccountTrade'
  | 'subscribeRaydiumLiquidity';

// Define unsubscription events (with 'unsubscribe' prefix)
type PumpPortalUnsubscribeEvent =
  | 'unsubscribeNewToken'
  | 'unsubscribeTokenTrade'
  | 'unsubscribeAccountTrade'
  | 'unsubscribeRaydiumLiquidity';

type PumpPortalPayload = {
  method: PumpPortalEvent | PumpPortalUnsubscribeEvent;
  keys?: string[];
};

type TradeOptions = {
  apiKey: string;
  action: 'buy' | 'sell';
  mint: string;
  amount: number | string; // Can be a percentage string like "100%"
  denominatedInSol: boolean;
  slippage: number;
  priorityFee: number;
  pool?: 'pump' | 'raydium' | 'auto';
  skipPreflight?: boolean;
};

type TradeLocalOptions = {
  publicKey: string;
  action: 'buy' | 'sell';
  mint: string;
  amount: number | string;
  denominatedInSol: boolean;
  slippage: number;
  priorityFee: number;
  pool?: 'pump' | 'raydium' | 'auto';
};

type CreateWalletResponse = {
  apiKey: string;
  walletPublicKey: string;
  privateKey: string;
};

export default class PumpPortalSDK {
  private ws: WebSocket;
  private onMessageCallback?: (data: string) => void;
  private isSubscribed: Set<PumpPortalEvent> = new Set();

  constructor() {
    this.ws = new WebSocket('wss://pumpportal.fun/api/data');
    this.ws.on('open', () => {
      console.log('Connected to PumpPortal');
    });

    this.ws.on('message', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.toString());
      }
    });

    this.ws.on('close', () => {
      console.log('Connection closed');
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private send(payload: PumpPortalPayload): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.log('WebSocket is not open');
    }
  }

  public subscribe(event: PumpPortalEvent, keys: string[] = []): void {
    if (this.isSubscribed.has(event)) {
      console.log(`Already subscribed to ${event}`);
      return;
    }

    const payload: PumpPortalPayload = { method: event, keys };
    this.send(payload);
    this.isSubscribed.add(event);
    console.log(`Subscribing to ${event}`);
  }

  public unsubscribe(event: PumpPortalEvent, keys: string[] = []): void {
    if (!this.isSubscribed.has(event)) {
      console.log(`Not subscribed to ${event}`);
      return;
    }

    const unsubscribeEvent = `unsubscribe${event.slice(9)}` as PumpPortalUnsubscribeEvent;
    const payload: PumpPortalPayload = { method: unsubscribeEvent, keys };
    this.send(payload);
    this.isSubscribed.delete(event);
    console.log(`Unsubscribing from ${event}`);
  }

  public close(): void {
    this.ws.close();
    console.log('WebSocket connection closed');
  }

  public onMessage(callback: (data: string) => void): void {
    this.onMessageCallback = callback;
  }

  public async tradeToken(options: TradeOptions): Promise<any> {
    try {
      const response = await fetch(`https://pumpportal.fun/api/trade?api-key=${options.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: options.action,
          mint: options.mint,
          amount: options.amount,
          denominatedInSol: options.denominatedInSol,
          slippage: options.slippage,
          priorityFee: options.priorityFee,
          pool: options.pool || 'pump',
          skipPreflight: options.skipPreflight ?? true
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Trade request failed:', error);
      throw error;
    }
  }

  public async tradeLocalToken(options: TradeLocalOptions): Promise<VersionedTransaction> {
    try {
      const response = await fetch(`https://pumpportal.fun/api/trade-local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }

      const serializedTx = await response.arrayBuffer();
      return VersionedTransaction.deserialize(new Uint8Array(serializedTx));
    } catch (error) {
      console.error('Error fetching local transaction:', error);
      throw error;
    }
  }

  public async createWallet(): Promise<CreateWalletResponse> {
    try {
      const response = await fetch("https://pumpportal.fun/api/create-wallet", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      const data = await response.json();

      const walletData: CreateWalletResponse = data as CreateWalletResponse;

      return walletData; 
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }
}
