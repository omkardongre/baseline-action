import { describe, it, expect } from 'vitest';
import { generateSARIF } from './sarif';

describe('SARIF Generator', () => {
  it('should generate valid SARIF structure', () => {
    const results = [
      {
        file: 'test.js',
        language: 'javascript' as const,
        features: [],
        violations: [
          {
            ruleId: 'test-rule',
            severity: 'error' as const,
            message: 'Test violation',
            feature: {
              feature: 'test-api',
              category: 'api' as const,
              line: 1,
              column: 1,
              source: 'test',
            },
          },
        ],
        suggestions: [],
        metrics: {
          compatibilityScore: 80,
          totalFeatures: 1,
          widelyAvailable: 0,
          newlyAvailable: 0,
          limitedSupport: 1,
        },
      },
    ];

    const sarif = generateSARIF(results);

    expect(sarif.version).toBe('2.1.0');
    expect(sarif.$schema).toContain('sarif-schema');
    expect(sarif.runs).toHaveLength(1);
    expect(sarif.runs[0].tool.driver.name).toBe('Baseline Suite');
  });

  it('should handle empty results', () => {
    const sarif = generateSARIF([]);

    expect(sarif.runs[0].results).toHaveLength(0);
    expect(sarif.runs[0].tool.driver.rules).toHaveLength(0);
  });

  it('should generate correct severity levels', () => {
    const results = [
      {
        file: 'test.js',
        language: 'javascript' as const,
        features: [],
        violations: [
          {
            ruleId: 'test',
            severity: 'warning' as const,
            message: 'Warning',
            feature: {
              feature: 'test',
              category: 'api' as const,
              line: 1,
              column: 1,
              source: 'test',
            },
          },
        ],
        suggestions: [],
        metrics: {
          compatibilityScore: 90,
          totalFeatures: 1,
          widelyAvailable: 1,
          newlyAvailable: 0,
          limitedSupport: 0,
        },
      },
    ];

    const sarif = generateSARIF(results);
    expect(sarif.runs[0].results[0].level).toBe('warning');
  });
});
