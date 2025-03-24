# @bert0rm/umami-client

## Overview

The Umami node client allows you to send data to Umami on the server side.

## Installation

```shell
npm install @bert0rm/umami-client
```

This command will install api client [npm package](https://www.npmjs.com/package/@bert0rm/umami-client).
## Usage

```js
import umami from '@bert0rm/umami-client';

//~ init
let umamiClient = new umami.Umami({
  websiteId: '50429a93-8479-4073-be80-d5d29c09c2ec', // Your website id
  hostUrl: 'https://umami.mywebsite.com' // URL to your Umami instance
  // ,userAgent // (optional) agent specifications ( OS / Browser / Device )
});

//~ track a page
await umamiClient.trackPageView();

//~ track a page with custom properties
const url = `/home`;
const title = "title of /home";
let event = {url, title}
await umamiClient.trackPageView(event);

//~ track a custom event
const event_name = "button-click"
const data = {"color": "red"};
await umamiClient.trackEvent(event_name, data);

//~ track a custom event for revenue reporting
const event_name = "checkout-store"
const data = {"item": "shirt", revenue: 19.99, currency: 'USD'};
await umamiClient.trackEvent(event_name, data);

//~ (optional) identify : add custom attributes to current session
const identifyOptions = {
  "attribute": "11.23",
}
await umamiClient.identify(identifyOptions);
```

If you're using Umami Cloud, then you can use `https://cloud.umami.is` as `hostUrl`.

For the `.trackPageView(payload)` function's `payload` argument, the properties you can send are:

- **hostname**: Hostname of server
- **language**: Client language (eg. en-US)
- **referrer**: Page referrer
- **screen**: Screen dimensions (eg. 1920x1080)
- **title**: Page title
- **url**: Page url

For the `.trackEvent(event_name, data)` function, you can add as many properties in `data` as you'd like.
- **event_name**: Event name
- **data**: Event data custom properties (values must be a `string`, `number`, or `Date`)
