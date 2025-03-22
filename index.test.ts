import umami, { UmamiEventData, UmamiOptions, UmamiPayload } from './index';

const mockFetchResponse = {
  ok: true,
  json: jest.fn().mockResolvedValue({ success: true }),
};

// Helper function to mock fetch
const mockFetch = () => {
  global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);
};

// Helper function to run common tests
const runCommonTests = () => {
  test('should initialize with default options', () => {
    expect(umami.options.websiteId).toBe('test-website');
    expect(umami.options.hostUrl).toBe('https://example.com');
  });

  test('should track page views', async () => {
    mockFetch();
    const response = await umami.trackPageView();
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should track page views with payload', async () => {
    const event: UmamiPayload = { title: 'test' };

    mockFetch();
    const response = await umami.trackPageView(event);
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should error on page view bad payload', async () => {
    const event = undefined as unknown as UmamiPayload;

    mockFetch();
    try {
      await umami.trackPageView(event);
    } catch (error) {
      expect(error).toEqual('Invalid payload.');
    }
  });

  test('should track custom events', async () => {
    mockFetch();
    const response = await umami.trackEvent('button_press');
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should track custom events with payload', async () => {
    const event: UmamiEventData = { id: 'test' };

    mockFetch();
    const response = await umami.trackEvent('button_press', event);
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should error on custom event bad payload', async () => {
    const event = undefined as unknown as UmamiEventData;

    mockFetch();
    try {
      await umami.trackEvent('button_press', event);
    } catch (error) {
      expect(error).toEqual('Invalid payload.');
    }
  });

  test('should identify user', async () => {
    const properties = { userId: 'user123' };

    mockFetch();
    const response = await umami.identify(properties);
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should identify user with no inputs', async () => {
    mockFetch();
    const response = await umami.identify();
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should reset properties', () => {
    umami.reset();
    expect(umami.properties).toEqual({});
  });
};

describe('Umami', () => {
  const options: UmamiOptions = {
    websiteId: 'test-website',
    hostUrl: 'https://example.com',
  };

  beforeEach(() => {
    umami.reset();
    umami.init(options);
  });

  runCommonTests();
});

describe('Umami with user agent', () => {
  const options: UmamiOptions = {
    websiteId: 'test-website',
    hostUrl: 'https://example.com',
    userAgent: 'Mozilla',
  };

  beforeEach(() => {
    umami.reset();
    umami.init(options);
  });

  runCommonTests();
});
