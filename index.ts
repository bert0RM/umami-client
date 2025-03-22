import { version } from './package.json';

export interface UmamiOptions {
  websiteId: string;
  hostUrl?: string;
  sessionId?: string;
  userAgent?: string;
}

export interface UmamiPayload {
  session?: string;
  hostname?: string;
  language?: string;
  referrer?: string;
  screen?: string;
  title?: string;
  url?: string;
  name?: string;
  data?: {
    [key: string]: string | number | Date;
  };
}

export interface UmamiEventData {
  [key: string]: string | number | Date;
}

enum EventType {
  Event = 'event',
  Identify = 'identify',
}

export class Umami {
  options: UmamiOptions;
  properties: object;

  constructor() {
    this.properties = {};
    this.options = { websiteId: '' };
  }

  init(options: UmamiOptions) {
    this.options = { ...options };
  }

  private send(payload: UmamiPayload, type: EventType = EventType.Event) {
    const { hostUrl, userAgent, websiteId } = this.options;

    return fetch(`${hostUrl}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent || `Mozilla/5.0 Umami/${version}`,
      },
      body: JSON.stringify({ type, payload: {...payload, website: websiteId } }),
    });
  }


  /**
   * Tracks a page view event with specified or default parameters and sends the information to the server.
   *
   * @param {UmamiPayload} [payload] - Optional additional data to send with the page view event.
   * Overrides defaults obtained from the browser.
   * @return {Promise<Response>} - A promise that resolves to the server response from the tracking event.
   */
  trackPageView(payload?: UmamiPayload): Promise<Response> {
    return this.send(
      {
        hostname: window.location.hostname,
        language: navigator.language,
        referrer: document.referrer,
        screen: `${window.screen.width}x${window.screen.height}`,
        title: document.title,
        url: window.location.pathname,
        ...payload,
      },
      EventType.Event,
    );
  }

  /**
   * Tracks an event by either sending a payload or event details to the server.
   * This method can handle events specified as a string or as a payload object.
   *
   * @param {UmamiPayload | string} event - The event to track, either as a payload object or a string representing the event name.
   * @param {UmamiEventData} [eventData] - Optional additional data related to the event, provided when the event is specified as a string.
   * @return {Promise} A Promise that resolves when the event is successfully sent or rejects with an error if the payload is invalid.
   */
  trackEvent(event: UmamiPayload | string, eventData?: UmamiEventData): Promise<Response> {
    const type = typeof event;

    switch (type) {
      case 'string':
        return this.send({
          name: event as string,
          data: eventData,
        });
      case 'object':
        return this.send({ ...(event as UmamiPayload) });
    }

    return Promise.reject('Invalid payload.');
  }

  track(event: UmamiPayload | string, eventData?: UmamiEventData) {
    const type = typeof event;

    switch (type) {
      case 'string':
        return this.send({
          name: event as string,
          data: eventData,
        });
      case 'object':
        return this.send({ ...(event as UmamiPayload) });
    }

    return Promise.reject('Invalid payload.');
  }

  identify(properties: object = {}) {
    this.properties = { ...this.properties, ...properties };
    const { sessionId } = this.options;

    return this.send(
      { session: sessionId, data: { ...this.properties } },
      EventType.Identify,
    );
  }

  reset() {
    this.properties = {};
  }
}

const umami = new Umami();

export default umami;
