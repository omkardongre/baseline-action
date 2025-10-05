/**
 * GitHub Action Entry Point
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import { scanFiles } from './scanner';
import { generateSARIF } from './sarif';
import { postComment } from './comment';
import { writeFileSync } from 'fs';

async function run(): Promise<void> {
  try {
    // Get inputs
    const githubToken = core.getInput('github-token');
    const baselineYear = parseInt(core.getInput('baseline-year'), 10);
    const allowNewly = core.getInput('allow-newly') === 'true';
    const allowLimited = core.getInput('allow-limited') === 'true';
    const failOnError = core.getInput('fail-on-error') === 'true';
    const filePatterns = core.getInput('files');
    const uploadSarif = core.getInput('upload-sarif') === 'true';

    core.info(`🔍 Scanning with baseline year: ${baselineYear}`);

    // Scan files
    const results = await scanFiles({
      patterns: filePatterns.split(' '),
      baselineYear,
      allowNewly,
      allowLimited,
    });

    // Set outputs
    core.setOutput('total-files', results.totalFiles);
    core.setOutput('files-with-issues', results.filesWithIssues);
    core.setOutput('total-violations', results.totalViolations);

    // Generate SARIF
    if (uploadSarif) {
      const sarif = generateSARIF(results.fileResults);
      const sarifPath = 'baseline-results.sarif';
      writeFileSync(sarifPath, JSON.stringify(sarif, null, 2));
      core.setOutput('sarif-file', sarifPath);
      core.info(`📄 SARIF file generated: ${sarifPath}`);
    }

    // Post PR comment
    if (github.context.payload.pull_request && githubToken) {
      await postComment(githubToken, results);
    }

    // Summary
    core.summary.addHeading('📊 Baseline Compatibility Report');
    core.summary.addTable([
      [{ data: 'Metric', header: true }, { data: 'Value', header: true }],
      ['Files Scanned', results.totalFiles.toString()],
      ['Files with Issues', results.filesWithIssues.toString()],
      ['Total Violations', results.totalViolations.toString()],
      ['Errors', results.errorCount.toString()],
      ['Warnings', results.warningCount.toString()],
    ]);
    await core.summary.write();

    // Fail if needed
    if (failOnError && results.errorCount > 0) {
      core.setFailed(`Found ${results.errorCount} compatibility error(s)`);
    } else if (results.totalViolations > 0) {
      core.warning(`Found ${results.totalViolations} compatibility issue(s)`);
    } else {
      core.info('✅ No compatibility issues found!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

run();
