# TelemetryDeck React
A library for easily integrating [TelemetryDeck](https://telemetrydeck.com/) into your React application.

## Installation

```shell
npm install -S @typedigital/telemetrydeck-react
```

## Setup

To set up this library, simply create a TelemetryDeck instance with the factory `createrTelemetryDeck` and pass it to the `TelemetryDeckProvider`, which should sit relatively high up in your component tree. You'll need a TelemetryDeck account and an app to be able to use this libary.

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TelemetryDeckProvider, createTelemetryDeck } from '@telemetrydeck/react';
import { Dashboard } from './Dashboard';

// Create the TelemetryDeck instance
const td = createTelemetryDeck({
  appID: "YOUR-APP-ID", // Replace with your actual App ID
  clientUser: "anonymous" // A unique identifier for the user
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

## Configuration

| Parameter   | Type                          | Required    | Description                                                                                                                                         |
|-------------|-------------------------------|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| appID       | string                        | Yes         | Your unique App ID from TelemetryDeck.                                                                                                              |
| clientUser  | string                        | Conditional | An identifier for the current user. Optional if using the browserPlugin, which generates a stable anonymous ID automatically.                        |
| testMode    | boolean                       | No          | Puts the instance in test mode. Defaults to true if the app is running on localhost or 127.0.0.1, and false otherwise.                               |
| plugins     | TelemetryDeckReactSDKPlugin[] | No          | An array of plugins to extend functionality and automatically enrich signal payloads (see the "Plugins" section below).                             |


## Basic usage

To send signals, use the `useTelemetryDeck` hook and destructure the various methods `signal`, `queue` and `flush` to TelemetryDeck.
For more information, see the [TelemetryDeck documentation](https://telemetrydeck.com/docs/).

### `signal`: Sending Immediately
The `signal` function sends an event to the TelemetryDeck API right away.

```tsx
import * as React from 'react';
import { useTelemetryDeck } from '@telemetrydeck/react';

function Dashboard() {
  const { signal } = useTelemetryDeck();

  // Example: Send a click event
  const handleClick = async () => {
    // The first argument is the signal type (a short, descriptive string)
    // The second argument (optional) is a payload object with additional data
    const response = await signal('buttonClicked', { component: 'CallToAction' });
    console.log(response); // The response from the TelemetryDeck API
  }

  // Example: Track a page view when the component mounts
  React.useEffect(() => {
    const { pathname } = window.location;
    signal('pageView', { component: 'Dashboard', path: pathname });
  }, [signal]);

  return (
    <>
      <h1>My Dashboard</h1>
      <button onClick={handleClick}>
        Click Me
      </button>
    </>
  );
}
```

### `queue` & `flush`: Batching Signals
You can collect multiple signals and send them together in a single network request. This is useful for reducing network traffic.

1. `queue(type, payload)`: Adds a signal to an internal queue without sending it.

2. `flush()`: Sends all signals currently in the queue to the API.

```tsx
import { useTelemetryDeck } from '@telemetrydeck/react';

function AnalyticsComponent() {
  const { queue, flush } = useTelemetryDeck();

  const handleComplexAction = () => {
    // Add multiple signals to the queue
    queue('actionStarted', { step: 1 });
    queue('intermediateStep', { step: 2 });
    queue('actionCompleted', { step: 3 });

    // Send all queued signals at once
    flush();
  };

  return <button onClick={handleComplexAction}>Perform Complex Action</button>;
}
```

## Plugins
Plugins are a powerful way to automatically enrich every signal payload with additional data. This is ideal for context you want to include with every signal, such as browser information or app versions.

### Using the Browser Plugin
We provide a browserPlugin that automatically collects useful context from the user's browser.

### Features:

Automatic User ID: If you omit `clientUser` from your configuration, the plugin will generate a stable, anonymous ID for the user based on browser properties.

Contextual Data: Automatically adds details like browser name, version, OS, and device type to every signal.

```tsx
import { createTelemetryDeck, browserPlugin } from '@telemetrydeck/react';

// Configure TelemetryDeck with the browser plugin
const td = createTelemetryDeck({
  appID: "YOUR-APP-ID",
  plugins: [browserPlugin]
  // clientUser is optional here!
});

```

### Creating Custom Plugins

You can easily create your own plugins. A plugin is a function that takes the next function in the chain and modifies the payload.

Here's an example of a plugin that adds a Git commit hash to every signal:

```tsx
import { TelemetryDeckReactSDKPlugin } from '@telemetrydeck/react';

// Get the Git hash (e.g., from an environment variable)
const commitHash = process.env.REACT_APP_COMMIT_HASH;

// Define your custom plugin
const gitVersionPlugin: TelemetryDeckReactSDKPlugin = (next) => (payload) => {
  // Call the next function to get the recursively enhanced payload
  const enhancedPayload = next(payload);

  // Add your custom data
  return {
    ...enhancedPayload,
    gitCommit: commitHash,
  };
};

// Use your plugin during initialization
const td = createTelemetryDeck({
  appID: "YOUR-APP-ID",
  clientUser: "anonymous",
  plugins: [gitVersionPlugin] // You can combine multiple plugins
});
```

##  React Native & Expo Support

`telemetrydeck-react` also supports React Native or Expo.
If no global implementation is available because you are not on the web, TelemetryDeck needs a subtle implementation which can be either injected by extending `globalThis` or added to the TelemetryDeck instance.

In the React Native context, a TextEncoder is also needed for it to work properly.

If you are developing an Expo project, you should install the following dependencies in addition to this library.

```shell
npm i -S expo-crypto text-encoding
```

### Monkey-Patching crypto and TextEncoder

To patch the functionalities, a file named `globals.js` should be created first. The following code should be added to this file. This code extends the global object for the React Native Context with the TextEncoder and the `crypto.subtle.digest` function, which converts a message to a hash.

```ts
// globals.js

import * as Crypto from 'expo-crypto';

globalThis.crypto = {
    subtle: {
        digest: (algorithm, message) => Crypto.digest(algorithm, message)
    }
}
global.TextEncoder = require('text-encoding').TextEncoder;
```

Finally, the created file should be imported into the `index.js` or any other root file for the bundler.

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

<div style="background-color: #ffffff; padding: 10px; width: 350px; height: 65px">

[<img src="https://typedigital.de/static/13fdfb01fd88e0f50b8d7d09cce92b58/a9476/Typedigital-Logo-Paket.webp" width=350 />](https://typedigital.de)

</div>
