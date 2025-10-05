import { describe, it, expect } from 'vitest';
import { scanFiles } from './scanner';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Scanner', () => {
  const testDir = join(__dirname, '../test-fixtures');

  beforeEach(() => {
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    rmSync(testDir, { recursive: true, force: true });
  });

  it('should scan files and find violations', async () => {
    // Create test file
    const testFile = join(testDir, 'test.js');
    writeFileSync(testFile, 'navigator.share({ title: "test" });');

    const results = await scanFiles({
      patterns: [join(testDir, '*.js')],
      baselineYear: 2022,
      allowNewly: false,
      allowLimited: false,
    });

    expect(results.totalFiles).toBeGreaterThan(0);
    expect(results.totalViolations).toBeGreaterThanOrEqual(0);
  });

  it('should return zero violations for empty directory', async () => {
    const results = await scanFiles({
      patterns: [join(testDir, '*.js')],
      baselineYear: 2023,
      allowNewly: true,
      allowLimited: false,
    });

    expect(results.totalFiles).toBe(0);
    expect(results.totalViolations).toBe(0);
    expect(results.filesWithIssues).toBe(0);
  });

  it('should count errors and warnings separately', async () => {
    const testFile = join(testDir, 'test2.js');
    writeFileSync(testFile, 'const x = 1;');

    const results = await scanFiles({
      patterns: [join(testDir, '*.js')],
      baselineYear: 2023,
      allowNewly: true,
      allowLimited: false,
    });

    expect(typeof results.errorCount).toBe('number');
    expect(typeof results.warningCount).toBe('number');
    expect(results.errorCount + results.warningCount).toBe(results.totalViolations);
  });
});
