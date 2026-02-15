import { CommandAnalyzer } from '../src/core/analyzer';
import { Database } from '../src/core/database';
import { Logger } from '../src/core/logger';
import { CopilotIntegration } from '../src/integrations/copilot';
import chalk from 'chalk';

async function runVerification() {
    console.log(chalk.bold('🔍 Starting CommandGuard Verification...'));

    // 1. Initialize Components
    console.log(chalk.blue('Initializing components...'));
    const db = new Database();
    const logger = new Logger();
    const copilot = new CopilotIntegration();
    const analyzer = new CommandAnalyzer(db, logger, copilot);

    // 2. Test Copilot Status
    console.log(`Copilot Enabled: ${copilot.isEnabled() ? chalk.green('Yes') : chalk.red('No')}`);
    if (!copilot.isEnabled()) {
        console.log(chalk.yellow('⚠️  Skipping AI verification steps because Copilot is disabled based on checks.'));
    }

    // 3. Test Analysis of Dangerous Command
    console.log(chalk.blue('\nTesting "rm -rf /" analysis...'));
    const dangerCmd = 'rm -rf /';
    const dangerResult = await analyzer.analyze(dangerCmd);

    if (dangerResult.severity === 'critical') {
        console.log(chalk.green('✅ Correctly identified as CRITICAL'));
    } else {
        console.log(chalk.red(`❌ Failed! Severity is ${dangerResult.severity}`));
    }

    // 4. Test Analysis of Safe Command
    console.log(chalk.blue('\nTesting "ls -la" analysis...'));
    const safeCmd = 'ls -la';
    const safeResult = await analyzer.analyze(safeCmd);

    if (safeResult.severity === 'safe') {
        console.log(chalk.green('✅ Correctly identified as SAFE'));
    } else {
        console.log(chalk.red(`❌ Failed! Severity is ${safeResult.severity}`));
    }

    // 5. Test Copilot Suggestion (if enabled)
    if (copilot.isEnabled()) {
        console.log(chalk.blue('\nTesting Copilot Suggestion...'));
        const suggestion = await copilot.suggest('list files');
        if (suggestion) {
            console.log(chalk.green(`✅ Copilot suggested: ${suggestion}`));
        } else {
            console.log(chalk.yellow('⚠️  Copilot returned no suggestion (might be network/auth issue).'));
        }
    }

    console.log(chalk.bold('\nVerification functionality tests complete.'));
}

runVerification().catch(console.error);
