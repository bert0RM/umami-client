import { version } from './package.json';

/**
 * Interface representing the configuration options for Umami.
 *
 * @property websiteId - The unique identifier for the website being tracked. This is a required property.
 * @property hostUrl - The base URL of the Umami server. Must not end with a `/`. Optional.
 * @property sessionId - A unique identifier for the session. This can be used to track a specific user session. Optional.
 * @property userAgent - The user agent string of the client making the request. Optional.
 */
export interface UmamiOptions {
  websiteId: string;
  hostUrl?: string;
  sessionId?: string;
  userAgent?: string;
}

/**
 * Represents the payload structure used for Umami.
 */
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

/**
 * Represents a structure for event data in the Umami analytics system.
 * The data is represented as a collection of key-value pairs where the keys are strings.
 *
 * Values associated with the keys can be of the following types:
 * - string: Used to represent textual data.
 * - number: Used to represent numeric values.
 * - Date: Used to represent temporal information.
 *
 * This interface provides the flexibility to define various kinds of event-related metadata
 * in a key-value format, making it adaptable to different use cases.
 */
export interface UmamiEventData {
  [key: string]: string | number | Date;
}

enum EventType {
  Event = 'event',
  Identify = 'identify',
}

/**
 * Represents an instance of Umami used for tracking events.
 * Provides methods to initialize the instance, track specific actions, and manage user properties.
 */
export class Umami {
  options: UmamiOptions;
  properties: object;

  constructor() {
    this.properties = {};
    this.options = { websiteId: '' };
  }

  /**
   * Initializes the Umami instance with the given configuration options.
   *
   * @param {UmamiOptions} options - The configuration options for the Umami instance.
   * @return {void} Does not return a value.
   */
  init(options: UmamiOptions): void {
    this.options = { ...options };
  }

  /**
   * Sends an event or data payload to the server.
   *
   * @param {UmamiPayload} payload - The data payload to be sent, containing relevant event details.
   * @param {EventType} [type=EventType.Event] - The type of event being sent (default is EventType.Event).
   * @return {Promise<Response>} A promise that resolves with the server's response.
   */
  private send(payload: UmamiPayload, type: EventType = EventType.Event): Promise<Response> {
    const { hostUrl, userAgent, websiteId } = this.options;

    return fetch(`${hostUrl}/api/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': userAgent || `Mozilla/5.0 Umami/${version}`,
      },
      body: JSON.stringify({ type, payload: { ...payload, website: websiteId } }),
    });
  }

  /**
   * Tracks an event by either sending a payload or event details to the server.
   * This method can handle events specified as a string or as a payload object.
   *
   * @param {UmamiPayload | string} event - The event to track, either as a payload object or a string representing the event name.
   * @param {UmamiEventData} [eventData] - Optional additional data related to the event, provided when the event is specified as a string.
   * @return {Promise<Response>} A Promise that resolves when the event is successfully sent or rejects with an error if the payload is invalid.
   */
  track(event: UmamiPayload | string, eventData?: UmamiEventData): Promise<Response> {
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

  /**
   * Identifies a user by merging the provided properties with existing properties
   * and sends the identification data with a session ID.
   *
   * @param {object} [properties={}] - The user properties to be identified and merged with existing properties.
   * @return {Promise<Response>} A promise that resolves to the server response after sending the identification data.
   */
  identify(properties: object = {}): Promise<Response> {
    this.properties = { ...this.properties, ...properties };
    const { sessionId } = this.options;

    return this.send({ session: sessionId, data: { ...this.properties } }, EventType.Identify);
  }

  /**
   * Resets the properties of the current instance by clearing all existing properties.
   * @return {void} Does not return a value.
   */
  reset(): void {
    this.properties = {};
  }
}

const umami = new Umami();

export default umami;
