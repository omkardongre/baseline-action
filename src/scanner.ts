/**
 * File Scanner
 */

import { BaselineAnalyzer } from '@baseline-suite/core';
import type { BaselineConfig, AnalysisResult } from '@baseline-suite/core';
import { globby } from 'globby';
import { readFileSync } from 'fs';

export interface ScanOptions {
  patterns: string[];
  baselineYear: number;
  allowNewly: boolean;
  allowLimited: boolean;
}

export interface ScanResults {
  totalFiles: number;
  filesWithIssues: number;
  totalViolations: number;
  errorCount: number;
  warningCount: number;
  fileResults: AnalysisResult[];
}

export async function scanFiles(options: ScanOptions): Promise<ScanResults> {
  const config: BaselineConfig = {
    policy: {
      mode: 'year',
      year: options.baselineYear,
      allowNewly: options.allowNewly,
      allowLimited: options.allowLimited,
    },
  };

  // Find files
  const files = await globby(options.patterns, {
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/*.min.css',
    ],
    gitignore: true,
  });

  // Analyze files
  const analyzer = new BaselineAnalyzer();
  await analyzer.ensureDataLoaded();

  const fileResults: AnalysisResult[] = [];
  let totalViolations = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const file of files) {
    try {
      const code = readFileSync(file, 'utf-8');
      const result = await analyzer.analyzeFile(file, code, config);

      if (result.violations.length > 0) {
        fileResults.push(result);
        totalViolations += result.violations.length;
        errorCount += result.violations.filter((v) => v.severity === 'error').length;
        warningCount += result.violations.filter((v) => v.severity === 'warning').length;
      }
    } catch (error) {
      // Skip files that can't be parsed
      continue;
    }
  }

  return {
    totalFiles: files.length,
    filesWithIssues: fileResults.length,
    totalViolations,
    errorCount,
    warningCount,
    fileResults,
  };
}
