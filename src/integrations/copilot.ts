import { execSync } from 'child_process';
import chalk from 'chalk';

export class CopilotIntegration {
  private enabled: boolean = false;

  constructor() {
    this.checkDependencies();
  }

  private checkDependencies() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
    } catch {
      console.warn(chalk.yellow('⚠️ GitHub CLI (gh) not found. Copilot integration disabled.'));
      this.enabled = false;
      return;
    }

    try {
      // Check if gh copilot command is available (either via extension or built-in)
      execSync('gh copilot --help', { stdio: 'ignore' });
      this.enabled = true;
    } catch {
      console.warn(chalk.yellow('⚠️ GitHub Copilot not found. Install it with: gh extension install github/gh-copilot'));
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async analyzeCommand(command: string): Promise<any> {
    if (!this.enabled) return null;
    return this.assessRisk(command);
  }

  private escape(str: string): string {
    return str.replace(/"/g, '\\"');
  }

  async assessRisk(command: string): Promise<any> {
    if (!this.enabled) return null;
    try {
      const safeCommand = this.escape(command);
      const prompt = `Analyze this shell command for security risk: ${safeCommand}. Respond with ONLY: Severity: [Low/High/Critical], Explanation: [Short explanation]`;

      const output = execSync(`gh copilot -p "${prompt}" -s`, { encoding: 'utf-8' });

      const lowerOutput = output.toLowerCase();
      let severity = 'low';
      if (lowerOutput.includes('severity: high')) severity = 'high';
      if (lowerOutput.includes('severity: critical')) severity = 'critical';

      let explanation = output;
      const explMatch = output.match(/Explanation:\s*(.*)/i);
      if (explMatch && explMatch[1]) {
        explanation = explMatch[1].trim();
      }

      return {
        severity,
        explanation,
        alternatives: []
      };
    } catch (error) {
      return null;
    }
  }

  async getAlternatives(command: string): Promise<string[]> {
    if (!this.enabled) return [];
    try {
      const safeCommand = this.escape(command);
      const prompt = `Suggest 3 safer alternative shell commands for: ${safeCommand}. Output ONLY the commands, one per line, inside a code block.`;

      const output = execSync(`gh copilot -p "${prompt}" -s`, { encoding: 'utf-8' });

      // Parse markdown code blocks
      const matches = output.match(/```[\s\S]*?```/g);
      if (!matches) return [];

      const commands: string[] = [];
      matches.forEach(block => {
        const lines = block.replace(/```\w*\n?|```/g, '').split('\n');
        lines.forEach(line => {
          if (line.trim()) commands.push(line.trim());
        });
      });

      return commands.slice(0, 3);
    } catch {
      return [];
    }
  }

  async suggest(query: string): Promise<string> {
    if (!this.enabled) return '';
    try {
      const safeQuery = this.escape(query);
      const prompt = `Write a Windows shell command to: ${safeQuery}. Output ONLY the command inside a code block. No explanation.`;

      const output = execSync(`gh copilot -p "${prompt}" -s`, { encoding: 'utf-8' });
      const match = output.match(/```(?:\w*)\n([\s\S]*?)```/);
      return match ? match[1].trim() : '';
    } catch {
      return '';
    }
  }
}
