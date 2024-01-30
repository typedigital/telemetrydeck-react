# TelemetryDeck React
A library for using TelemetryDeck in your React app.

## Installation

```shell
npm install -S @typedigital/telemetrydeck-react
```

## Setup

To set up this library, simply create a TelemetryDeck instance with the factory `createrTelemetryDeck` and pass it to the `TelemetryDeckProvider`, which should sit relatively high up in your component tree. You'll need a TelemetryDeck account and an app to be able to use this libary.

```tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { TelemetryDeckProvider, createTelemetryDeck } from '@typedigital/telemetrydeck-react';
import { Dashboard } from './Dashboard';

const td = createTelemetryDeck({app: process.env.APP_ID, user: 'anonymous'});

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

[<img src="https://typedig.uber.space/assets/71ff4706-43e0-46f5-bab5-0fe6f07ad016" width=150 />](https://typedigital.de)
