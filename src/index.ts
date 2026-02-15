#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { CommandAnalyzer } from './core/analyzer';
import { Database } from './core/database';
import { Logger } from './core/logger';
import { installHooks } from './integrations/shell';
import { showDashboard } from './ui/dashboard';
import { analyzeCommand } from './cli';

import { CopilotIntegration } from './integrations/copilot';

const db = new Database();
const logger = new Logger();
const copilot = new CopilotIntegration();
const analyzer = new CommandAnalyzer(db, logger, copilot);

program.name('commandguard').version('1.0.0');

program.command('setup').action(async () => {
  console.log(chalk.blue('🔧 Installing...'));
  await installHooks();
  console.log(chalk.green('✅ Done! Restart terminal'));
});

program.command('analyze <command>').action(async (cmd) => {
  await analyzeCommand(cmd, analyzer, false);
});

program.command('dashboard').action(async () => {
  await showDashboard(db, 7);
});

program.command('intercept <command>').action(async (cmd) => {
  const result = await analyzer.interceptCommand(cmd, true);
  process.exit(result.shouldExecute ? 0 : 1);
});

const config = program.command('config');
config.command('set <key> <value>').action((key, value) => {
  db.setConfig(key, value);
  console.log(chalk.green(`✅ ${key} = ${value}`));
});

program.command('suggest <query>').alias('s').description('Ask AI to generate a command').action(async (query) => {
  console.log(chalk.blue(`🤖 Asking Copilot: "${query}"...`));
  const suggestion = await copilot.suggest(query);
  if (suggestion) {
    console.log(chalk.green('\n💡 Suggestion:'));
    console.log(chalk.bold(suggestion));
  } else {
    console.log(chalk.red('❌ No suggestion found or Copilot not enabled.'));
  }
});

program.parse();
