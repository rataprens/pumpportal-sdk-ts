import WebSocket from 'ws';

// Define subscription events
type PumpPortalEvent = 
  | 'subscribeNewToken' 
  | 'subscribeTokenTrade' 
  | 'subscribeAccountTrade' 
  | 'subscribeRaydiumLiquidity';

// Define unsubscribe events (with the 'unsubscribe' prefix)
type PumpPortalUnsubscribeEvent = 
  | 'unsubscribeNewToken' 
  | 'unsubscribeTokenTrade' 
  | 'unsubscribeAccountTrade' 
  | 'unsubscribeRaydiumLiquidity';

type PumpPortalPayload = {
  method: PumpPortalEvent | PumpPortalUnsubscribeEvent;
  keys?: string[];
};

export default class PumpPortalSDK {
  private ws: WebSocket;
  private onMessageCallback?: (data: string) => void; // Callback to handle incoming messages
  private isSubscribed: Set<PumpPortalEvent> = new Set(); // To track subscriptions

  constructor() {
    this.ws = new WebSocket('wss://pumpportal.fun/api/data');
    this.ws.on('open', () => {
      console.log('Connected to PumpPortal');
    });

    this.ws.on('message', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(data.toString());  // Call the callback if defined
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
      console.log(`You are already subscribed to ${event}`);
      return; // Prevent duplicate subscriptions
    }

    const payload: PumpPortalPayload = { method: event, keys };
    this.send(payload);
    this.isSubscribed.add(event);  // Register the subscription
    console.log(`Subscribing to ${event}`);
  }

  public unsubscribe(event: PumpPortalEvent, keys: string[] = []): void {
    if (!this.isSubscribed.has(event)) {
      console.log(`You are not subscribed to ${event}`);
      return; // Don't attempt to unsubscribe if not subscribed
    }

    const unsubscribeEvent = `unsubscribe${event.slice(9)}` as PumpPortalUnsubscribeEvent;
    const payload: PumpPortalPayload = { method: unsubscribeEvent, keys };
    this.send(payload);
    this.isSubscribed.delete(event);  // Remove the subscription
    console.log(`Unsubscribing from ${event}`);
  }

  public close(): void {
    this.ws.close();
    console.log('WebSocket connection closed');
  }

  // Method to set a callback for incoming messages
  public onMessage(callback: (data: string) => void): void {
    this.onMessageCallback = callback;
  }
}
