/**
 * SARIF Generator for GitHub Code Scanning
 */

import type { AnalysisResult } from '@baseline-suite/core';

export function generateSARIF(results: AnalysisResult[]) {
  return {
    version: '2.1.0',
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    runs: [
      {
        tool: {
          driver: {
            name: 'Baseline Suite',
            version: '1.0.0',
            informationUri: 'https://github.com/omkardongre/Baseline-Developer-Suite',
            rules: generateRules(results),
          },
        },
        results: generateResults(results),
      },
    ],
  };
}

function generateRules(results: AnalysisResult[]) {
  const ruleMap = new Map<string, any>();

  for (const result of results) {
    for (const violation of result.violations) {
      const ruleId = violation.ruleId || 'baseline-compatibility';

      if (!ruleMap.has(ruleId)) {
        ruleMap.set(ruleId, {
          id: ruleId,
          shortDescription: {
            text: 'Baseline compatibility issue',
          },
          fullDescription: {
            text: violation.message,
          },
          helpUri: violation.baselineInfo?.mdn_url || 'https://web.dev/baseline',
          properties: {
            category: 'compatibility',
          },
        });
      }
    }
  }

  return Array.from(ruleMap.values());
}

function generateResults(results: AnalysisResult[]) {
  const sarifResults = [];

  for (const result of results) {
    for (const violation of result.violations) {
      sarifResults.push({
        ruleId: violation.ruleId || 'baseline-compatibility',
        level: violation.severity === 'error' ? 'error' : 'warning',
        message: {
          text: violation.message,
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: result.file,
              },
              region: {
                startLine: violation.feature.line,
                startColumn: violation.feature.column,
              },
            },
          },
        ],
      });
    }
  }

  return sarifResults;
}
