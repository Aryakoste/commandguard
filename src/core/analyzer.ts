import chalk from 'chalk';
import inquirer from 'inquirer';
import { checkPatterns } from '../rules/patterns';
import { getRecommendations } from '../rules/recommendations';
import { parseCommand } from '../utils/parser';

import { CopilotIntegration } from '../integrations/copilot';

export class CommandAnalyzer {
  constructor(
    private db: any,
    private logger: any,
    private copilot: CopilotIntegration
  ) { }

  async analyze(command: string) {
    this.logger.log('info', 'Analyzing: ' + command);

    if (this.db.isWhitelisted(command)) {
      return { command, severity: 'safe', explanation: 'Whitelisted', shouldBlock: false, timestamp: new Date() };
    }

    const parsed = parseCommand(command);

    // 1. Static Pattern Matching (Fast, Local)
    const match = checkPatterns(command, parsed);

    if (match) {
      const result = {
        command, severity: match.severity, explanation: match.message,
        alternatives: getRecommendations(command, parsed),
        shouldBlock: match.severity === 'critical' || match.severity === 'high',
        timestamp: new Date()
      };
      this.db.logCommand(result);
      return result;
    }

    // 2. Heuristic Analysis for Hybrid Mode
    // Only call AI if the command looks suspicious or config says so
    const aiMode = this.db.getConfig('ai-mode') || 'auto';
    const suspiciousKeywords = ['rm ', 'del', 'delete', 'kill', 'sudo', 'chmod', 'chown', 'mv ', 'dd ', 'format', 'fdisk', 'mkfs', '>>', '>'];
    const isSuspicious = suspiciousKeywords.some(k => command.includes(k));

    if (this.copilot.isEnabled() && (aiMode === 'always' || (aiMode === 'auto' && isSuspicious))) {
      console.log(chalk.yellow('🤖 Analyzing potential risk with Copilot...'));
      const aiResult = await this.copilot.assessRisk(command);
      if (aiResult && (aiResult.severity === 'high' || aiResult.severity === 'critical')) {
        const result = {
          command, severity: aiResult.severity, explanation: aiResult.explanation,
          alternatives: aiResult.alternatives || [],
          shouldBlock: true,
          timestamp: new Date()
        };
        this.db.logCommand(result);
        return result;
      }
    }

    return { command, severity: 'safe', explanation: 'Safe', shouldBlock: false, timestamp: new Date() };
  }

  async interceptCommand(command: string, interactive: boolean): Promise<{ shouldExecute: boolean }> {
    const result = await this.analyze(command);

    if (result.severity === 'safe' || result.severity === 'low') {
      return { shouldExecute: true };
    }

    this.displayWarning(result);

    if (interactive && (result.severity === 'critical' || result.severity === 'high')) {
      const choices = [
        { name: '🚫 Abort (Recommended)', value: 'abort' },
        { name: '⚠️  Execute anyway', value: 'execute' }
      ];

      if (this.copilot.isEnabled()) {
        choices.push({ name: '🤖 Explain with AI', value: 'explain' });
        choices.push({ name: '💡 Suggest Alternatives (AI)', value: 'suggest' });
      }

      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: choices,
        default: 'abort'
      }]);

      if (answer.action === 'explain') {
        console.log(chalk.blue('🤖 Asking Copilot...'));
        const aiAnalysis = await this.copilot.analyzeCommand(command);
        console.log(chalk.gray('--------------------------------------------------'));
        console.log(chalk.bold('Copilot Explanation:'));
        console.log(aiAnalysis?.explanation || 'No explanation available.');
        console.log(chalk.gray('--------------------------------------------------'));

        // Ask again recursively
        return this.interceptCommand(command, interactive);
      }

      if (answer.action === 'suggest') {
        console.log(chalk.blue('🤖 Generating alternatives...'));
        const alternatives = await this.copilot.getAlternatives(command);
        if (alternatives.length > 0) {
          console.log(chalk.green('\n💡 Suggested Alternatives:'));
          alternatives.forEach((a: string, i: number) => console.log(`  ${i + 1}. ${a}`));

          // Allow user to pick one
          const pick = await inquirer.prompt([{
            type: 'list',
            name: 'replacement',
            message: 'Select an alternative to execute (or Go Back):',
            choices: [...alternatives.map(a => ({ name: a, value: a })), { name: '⬅️ Go Back', value: 'back' }]
          }]);

          if (pick.replacement !== 'back') {
            console.log(chalk.green(`\n✅ Copy and run this command:\n\n   ${pick.replacement}\n`));
            return { shouldExecute: false };
          }
        } else {
          console.log(chalk.yellow('No better alternatives found.'));
        }
        return this.interceptCommand(command, interactive);
      }

      const shouldExecute = answer.action === 'execute';
      this.db.updateCommandExecution(command, shouldExecute);
      return { shouldExecute };
    }

    return { shouldExecute: result.severity !== 'critical' };
  }

  private displayWarning(result: any) {
    console.log('\n' + chalk.red.bold('⛔ ' + result.severity.toUpperCase() + ' RISK'));
    console.log(chalk.cyan('Command: ' + result.command));
    console.log(chalk.yellow('\n📋 ' + result.explanation));
    if (result.alternatives) {
      console.log(chalk.green('\n💡 Safer:'));
      result.alternatives.forEach((a: string, i: number) => console.log(`  ${i + 1}. ${a}`));
    }
    console.log();
  }
}
