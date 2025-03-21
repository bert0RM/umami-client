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
