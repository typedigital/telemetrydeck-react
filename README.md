# TelemetryDeck React
A library for using TelemetryDeck in your React app.

## Installation

```shell
npm install -S @typedigital/telemetrydeck-react
```

## Setup

To set up this library, simply create a TelemetryDeck instance with the factory `createTelemetryDeck` and pass it to the `TelemetryDeckProvider`, which should sit relatively high up in your component tree. You'll need a TelemetryDeck account and an app to be able to use this library.

The `namespace` parameter is required and can be found in the [TelemetryDeck Dashboard](https://dashboard.telemetrydeck.com/).

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TelemetryDeckProvider, createTelemetryDeck } from '@typedigital/telemetrydeck-react';
import { Dashboard } from './Dashboard';

const td = createTelemetryDeck({
  appID: process.env.APP_ID,
  clientUser: 'anonymous',
  namespace: 'your-namespace',
});

const App = () => {

  return (
    <div>
      <TelemetryDeckProvider telemetryDeck={td}>
        <Dashboard />
      </TelemetryDeckProvider>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

## Basic usage

To send signals, use the `useTelemetryDeck` hook and destructure the various methods that can be used to modify the instance or send signals to TelemetryDeck.
For more information, see the [TelemetryDeck documentation](https://telemetrydeck.com/docs/).

```tsx
import * as React from 'react';
import { useTelemetryDeck } from '@typedigital/telemetrydeck-react';


function Dashboard() {

  const { signal } = useTelemetryDeck();

  const clickHandler = async () => {
    const res = await signal('click', { event: 'button-click', target: 'Call to Action' })
    console.log(res); // the response of the TelemetryDeck API
  }

  // If you want to track if a user saw a certain page or component just use an effect
  React.useEffect(() => {
    (async () => {
      const { pathname } = window.location;
      await signal('pageview', { component: 'dashboard', path: pathname });
    })();
  }, [])

  return (
    <React.Fragment>
      <h1>My Dashboard</h1>
      <button onClick={async () => await clickHandler()}>
        Click me
      </button>
    </React.Fragment>
  )
}

export {
  Dashboard
}
```

## React Native & Expo Support

`telemetrydeck-react` also supports React Native and Expo (SDK 51+).

### Automatic Development Mode Detection

In React Native, `testMode` is automatically enabled when the Metro bundler's `__DEV__` flag is `true` (i.e., during development). This prevents development signals from polluting your production analytics. You can explicitly override this behavior:

```tsx
const td = createTelemetryDeck({
  appID: 'YOUR_APP_ID',
  clientUser: 'anonymous',
  namespace: 'your-namespace',
  testMode: false, // Force testMode off even in development
});
```

### Polyfilling crypto.subtle

Since React Native does not provide a global `crypto.subtle` implementation, you need to polyfill it using `expo-crypto`. Since Expo SDK 51 (React Native 0.74+), `TextEncoder` is natively available in the Hermes engine and no longer requires a separate polyfill.

Install the required dependency using Expo's managed install command, which ensures version compatibility with your Expo SDK:

```shell
npx expo install expo-crypto
```

> **Expo SDK 50 and older:** If you are using Expo SDK 50 or older, `TextEncoder` is not available natively. You will need to install an additional polyfill such as `text-encoding` and assign it to `global.TextEncoder` in your `globals.js` file.

### Polyfilling crypto.subtle.digest

Create a file named `globals.js` with the following content. This extends the global object with the `crypto.subtle.digest` function required by TelemetryDeck for hashing.

```ts
// globals.js

import * as Crypto from 'expo-crypto';

globalThis.crypto = {
    subtle: {
        digest: (algorithm, message) => Crypto.digest(algorithm, message)
    }
};
```

Finally, import the file in your `index.js` or any other root file for the bundler.

```js
// index.js

import { registerRootComponent } from 'expo';
import './globals.js';
import App from './App';

registerRootComponent(App);
```

## Feedback & Contributions
We appreciate any feedback.
Pull requests, ideas for new features and bug reports are very welcome.

## License
MIT

## Sponsors

[<img src="https://typedig.uber.space/assets/71ff4706-43e0-46f5-bab5-0fe6f07ad016" width=150 />](https://typedigital.de)
