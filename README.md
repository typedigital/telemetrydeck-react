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
import { Component } from './component';

const td = createTelemetryDeck({app: process.env.APP_ID, user: 'anonymous'});

const App = () => {

  return (
    <div>
      <TelemetryDeckProvider telemetryDeck={td}>
        <Component />
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


function Component() {

  const { signal } = useTelemetryDeck();

  const clickHandler = async () => {
    const res = await signal({event: 'button-click', type: 'click'})
    console.log(res); // the response of the TelemetryDeck API
  }

  // If you want to track if a user saw a certain page or component just use an effect
  React.useEffect(() => {
    (async () => {
      await signal({event: 'component-view'});
    })();
  }, [])

  return (
    <React.Fragment>
      <h1>Component</h1>
      <button onClick={async () => await clickHandler()}>
        Click me
      </button>
    </React.Fragment>
  )
}

export {
  Component
}
```

##  React Native Support :construction:
We have not yet tested the integration in a React Native app.

## Feedback & Contributions
We appreciate any feedback.
Pull requests, ideas for new features and bug reports are very welcome.

## License
MIT
