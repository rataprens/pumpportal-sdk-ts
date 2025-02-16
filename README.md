# PumpPortal SDK

A TypeScript SDK to interact with the PumpPortal API. This SDK provides an easy-to-use interface for subscribing to token creation events, trades, and liquidity updates on PumpPortal.

## Features

- Subscribe to events like new token creation, token trades, account trades, and liquidity updates on Raydium.
- Unsubscribe from events.
- Simple and easy-to-use TypeScript interface.
- WebSocket-based communication for real-time updates.
- Create wallets directly via the API.
- Trade tokens using API or locally signed transactions.

## Installation

To install the PumpPortal SDK in your TypeScript project, run the following command:

```bash
npm install pumpportal-sdk
```

## Usage

Here's an example of how to use the SDK:

```typescript
import PumpPortalSDK from 'pumpportal-sdk';

async function testPumpPortalSDK() {
  const sdk = new PumpPortalSDK();

  // Set up message handler
  sdk.onMessage((data) => {
    console.log('Received message:', data);
  });

  // Subscribe to new token creation events
  sdk.subscribe('subscribeNewToken');

  // Wait a bit and then unsubscribe
  setTimeout(() => {
    console.log('Unsubscribing from events...');
    sdk.unsubscribe('subscribeNewToken');
    sdk.close(); // Close the WebSocket connection
  }, 10000);

  // Create a new wallet
  try {
    const wallet = await sdk.createWallet();
    console.log('Wallet created:', wallet);
  } catch (error) {
    console.error('Error creating wallet:', error);
  }
}

testPumpPortalSDK();
```

## API

### `PumpPortalSDK`

#### `constructor()`

Creates a new instance of the PumpPortal SDK and connects to the WebSocket API.

#### `subscribe(event: PumpPortalEvent, keys: string[] = [])`

Subscribes to a specific event.

- **event**: The event to subscribe to (e.g., `subscribeNewToken`, `subscribeTokenTrade`, etc.).
- **keys**: An array of keys to filter the events (optional).

#### `unsubscribe(event: PumpPortalEvent, keys: string[] = [])`

Unsubscribes from a specific event.

- **event**: The event to unsubscribe from.
- **keys**: An array of keys to filter the events (optional).

#### `close()`

Closes the WebSocket connection.

#### `onMessage(callback: (data: string) => void)`

Sets up a callback to handle incoming messages.

- **callback**: A function that receives the raw message data as a string.

#### `createWallet(): Promise<CreateWalletResponse>`

Creates a new wallet and returns its details.

- **Returns**: `CreateWalletResponse` containing `apiKey`, `walletPublicKey`, and `privateKey`.

#### `tradeToken(options: TradeOptions): Promise<any>`

Trades a token using the API.

- **options**: Contains trade parameters including API key, action (buy/sell), token mint address, amount, slippage, priority fee, and pool selection.
- **Returns**: The result of the trade operation.

#### `tradeLocalToken(options: TradeLocalOptions): Promise<VersionedTransaction>`

Generates a locally signed transaction for trading a token.

- **options**: Similar to `tradeToken`, but requires a user-provided public key.
- **Returns**: A `VersionedTransaction` object ready for signing and submission.

## Contributing

Feel free to fork the repository and submit pull requests. Contributions are welcome!

## License

This project is licensed under the ISC License.
