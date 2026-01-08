import { 
  loadMonetizationConfig, 
  FeatureFlags, 
  UsageTracker, 
  RateLimiter, 
  PRICING_TIERS,
  PricingTier 
} from '../src/config/monetization.js';

// Mock environment variables
const originalEnv = process.env;

describe('Monetization Configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  afterAll(() => {
    process.env = originalEnv;
  });

  test('should load configuration with default values', () => {
    delete process.env.MONETIZATION_ENABLED;
    delete process.env.JWT_SECRET;

    const config = loadMonetizationConfig();

    expect(config.MONETIZATION_ENABLED).toBe('false');
    expect(config.JWT_SECRET).toBe('default-jwt-secret-change-in-production');
    expect(config.ENVIRONMENT).toBe('development');
  });

  test('should load configuration from environment variables', () => {
    process.env.MONETIZATION_ENABLED = 'true';
    process.env.JWT_SECRET = 'test-secret';
    process.env.ENVIRONMENT = 'production';

    const config = loadMonetizationConfig();

    expect(config.MONETIZATION_ENABLED).toBe('true');
    expect(config.JWT_SECRET).toBe('test-secret');
    expect(config.ENVIRONMENT).toBe('production');
  });
});

describe('Feature Flags', () => {
  const demoConfig = {
    MONETIZATION_ENABLED: 'false',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'development' as const
  };

  const prodConfig = {
    MONETIZATION_ENABLED: 'true',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'production' as const
  };

  test('should allow all features when monetization is disabled', () => {
    const featureFlags = new FeatureFlags(demoConfig, 'FREE');

    expect(featureFlags.isMonetizationEnabled()).toBe(false);
    expect(featureFlags.hasFeature('any_feature')).toBe(true);
    expect(featureFlags.isWithinApiCallLimits(1000)).toBe(true);
    expect(featureFlags.canAddTeamMembers(100)).toBe(true);
    expect(featureFlags.canAddSpecs(1000)).toBe(true);
    expect(featureFlags.getRemainingApiCalls(100)).toBe(-1); // Unlimited
  });

  test('should enforce limits when monetization is enabled', () => {
    const featureFlags = new FeatureFlags(prodConfig, 'FREE');

    expect(featureFlags.isMonetizationEnabled()).toBe(true);
    expect(featureFlags.hasFeature('basic_validation')).toBe(true);
    expect(featureFlags.hasFeature('custom_rules')).toBe(false); // Not in FREE tier
    expect(featureFlags.isWithinApiCallLimits(50)).toBe(true);
    expect(featureFlags.isWithinApiCallLimits(150)).toBe(false); // Exceeds FREE limit
    expect(featureFlags.canAddTeamMembers(2)).toBe(false); // Exceeds FREE limit
    expect(featureFlags.canAddSpecs(6)).toBe(false); // Exceeds FREE limit
  });

  test('should respect tier hierarchy', () => {
    const freeFlags = new FeatureFlags(prodConfig, 'FREE');
    const proFlags = new FeatureFlags(prodConfig, 'PROFESSIONAL');
    const enterpriseFlags = new FeatureFlags(prodConfig, 'ENTERPRISE');

    // Free tier limitations
    expect(freeFlags.hasFeature('basic_validation')).toBe(true);
    expect(freeFlags.hasFeature('custom_rules')).toBe(false);
    expect(freeFlags.hasFeature('team_collaboration')).toBe(false);

    // Professional tier capabilities
    expect(proFlags.hasFeature('basic_validation')).toBe(true);
    expect(proFlags.hasFeature('custom_rules')).toBe(true);
    expect(proFlags.hasFeature('team_collaboration')).toBe(false);

    // Enterprise tier capabilities
    expect(enterpriseFlags.hasFeature('basic_validation')).toBe(true);
    expect(enterpriseFlags.hasFeature('custom_rules')).toBe(true);
    expect(enterpriseFlags.hasFeature('team_collaboration')).toBe(true);
    expect(enterpriseFlags.hasFeature('governance_workflows')).toBe(true);
  });

  test('should handle unlimited tiers correctly', () => {
    const enterpriseFlags = new FeatureFlags(prodConfig, 'ENTERPRISE');

    expect(enterpriseFlags.isWithinApiCallLimits(1000000)).toBe(true);
    expect(enterpriseFlags.canAddTeamMembers(1000)).toBe(true);
    expect(enterpriseFlags.canAddSpecs(10000)).toBe(true);
    expect(enterpriseFlags.getRemainingApiCalls(100)).toBe(-1); // Unlimited
  });
});

describe('Usage Tracker', () => {
  const demoConfig = {
    MONETIZATION_ENABLED: 'false',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'development' as const
  };

  const prodConfig = {
    MONETIZATION_ENABLED: 'true',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'production' as const
  };

  test('should skip tracking when monetization is disabled', async () => {
    const usageTracker = new UsageTracker(demoConfig);
    const usage = await usageTracker.trackApiUsage('user123', 'FREE');

    expect(usage).toBe(0);
  });

  test('should track usage when monetization is enabled', async () => {
    const usageTracker = new UsageTracker(prodConfig);
    const usage = await usageTracker.trackApiUsage('user123', 'FREE');

    expect(typeof usage).toBe('number');
    expect(usage).toBeGreaterThanOrEqual(0);
  });

  test('should get current usage', async () => {
    const usageTracker = new UsageTracker(prodConfig);
    const currentUsage = await usageTracker.getCurrentUsage('user123');

    expect(typeof currentUsage).toBe('number');
    expect(currentUsage).toBeGreaterThanOrEqual(0);
  });
});

describe('Rate Limiter', () => {
  const demoConfig = {
    MONETIZATION_ENABLED: 'false',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'development' as const
  };

  const prodConfig = {
    MONETIZATION_ENABLED: 'true',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'production' as const
  };

  test('should allow all requests when monetization is disabled', async () => {
    const rateLimiter = new RateLimiter(demoConfig);
    const result = await rateLimiter.checkRateLimit('user123', 'FREE');

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(-1); // Unlimited
  });

  test('should enforce limits when monetization is enabled', async () => {
    const rateLimiter = new RateLimiter(prodConfig);
    const result = await rateLimiter.checkRateLimit('user123', 'FREE');

    expect(result.allowed).toBeDefined();
    expect(result.remaining).toBeDefined();
    expect(typeof result.remaining).toBe('number');
  });
});

describe('Pricing Tiers', () => {
  test('should have correct pricing structure', () => {
    expect(PRICING_TIERS.FREE.price).toBe(0);
    expect(PRICING_TIERS.FREE.limits.apiCallsPerMonth).toBe(100);
    expect(PRICING_TIERS.FREE.limits.maxTeamMembers).toBe(1);

    expect(PRICING_TIERS.PROFESSIONAL.price).toBe(29);
    expect(PRICING_TIERS.PROFESSIONAL.limits.apiCallsPerMonth).toBe(10000);
    expect(PRICING_TIERS.PROFESSIONAL.limits.maxTeamMembers).toBe(5);

    expect(PRICING_TIERS.TEAM.price).toBe(99);
    expect(PRICING_TIERS.TEAM.limits.apiCallsPerMonth).toBe(100000);
    expect(PRICING_TIERS.TEAM.limits.maxTeamMembers).toBe(20);

    expect(PRICING_TIERS.ENTERPRISE.price).toBe(499);
    expect(PRICING_TIERS.ENTERPRISE.limits.apiCallsPerMonth).toBe(-1); // Unlimited
    expect(PRICING_TIERS.ENTERPRISE.limits.maxTeamMembers).toBe(-1); // Unlimited
  });

  test('should have correct feature sets', () => {
    const freeFeatures = PRICING_TIERS.FREE.limits.features;
    expect(freeFeatures).toContain('basic_validation');
    expect(freeFeatures).toContain('breaking_change_detection');
    expect(freeFeatures).not.toContain('custom_rules');

    const proFeatures = PRICING_TIERS.PROFESSIONAL.limits.features;
    expect(proFeatures).toContain('basic_validation');
    expect(proFeatures).toContain('breaking_change_detection');
    expect(proFeatures).toContain('custom_rules');
    expect(proFeatures).toContain('security_scanning');
    expect(proFeatures).not.toContain('team_collaboration');

    const enterpriseFeatures = PRICING_TIERS.ENTERPRISE.limits.features;
    expect(enterpriseFeatures).toContain('governance_workflows');
    expect(enterpriseFeatures).toContain('sso');
    expect(enterpriseFeatures).toContain('priority_support');
  });
});

describe('Tier Upgrades', () => {
  const config = {
    MONETIZATION_ENABLED: 'true',
    JWT_SECRET: 'test-secret',
    ENVIRONMENT: 'production' as const
  };

  test('should allow tier upgrades', () => {
    const featureFlags = new FeatureFlags(config, 'FREE');

    expect(featureFlags.hasFeature('custom_rules')).toBe(false);

    featureFlags.upgradeTier('PROFESSIONAL');
    expect(featureFlags.hasFeature('custom_rules')).toBe(true);
    expect(featureFlags.hasFeature('team_collaboration')).toBe(false);

    featureFlags.upgradeTier('ENTERPRISE');
    expect(featureFlags.hasFeature('team_collaboration')).toBe(true);
    expect(featureFlags.hasFeature('governance_workflows')).toBe(true);
  });

  test('should return correct tier information', () => {
    const featureFlags = new FeatureFlags(config, 'TEAM');
    const tierInfo = featureFlags.getUserTier();

    expect(tierInfo.id).toBe('team');
    expect(tierInfo.name).toBe('Team');
    expect(tierInfo.price).toBe(99);
    expect(tierInfo.limits.apiCallsPerMonth).toBe(100000);
  });
});
