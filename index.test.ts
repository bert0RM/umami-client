import umami, { UmamiOptions, UmamiPayload } from './index';

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

  test('should track events', async () => {
    const eventName = 'page_view';
    const eventData = { screen: '1920x1080' };

    mockFetch();
    const response = await umami.track(eventName, eventData);
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should track events with payload', async () => {
    const event: UmamiPayload = { title: 'test', website: 'test' };
    const eventData = { screen: '1920x1080' };

    mockFetch();
    const response = await umami.track(event, eventData);
    expect(fetch).toHaveBeenCalled();
    expect(response.ok).toBe(true);
  });

  test('should error on bad payload', async () => {
    const event = undefined as unknown as UmamiPayload;
    const eventData = { screen: '1920x1080' };

    mockFetch();
    try {
      await umami.track(event, eventData);
    } catch (error) {
      expect(error).toEqual("Invalid payload.");
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
