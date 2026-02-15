import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';

export async function installHooks() {
  const shell = (process.env.SHELL || '').includes('zsh') ? 'zsh' : 'bash';
  const rcFile = shell === 'zsh' ? '.zshrc' : '.bashrc';
  const rcPath = path.join(os.homedir(), rcFile);

  const hook = `
# CommandGuard hook
commandguard_check() {
  commandguard intercept "$1" || return 1
}
trap 'commandguard_check "$BASH_COMMAND"' DEBUG
`;

  if (fs.existsSync(rcPath)) {
    let content = fs.readFileSync(rcPath, 'utf-8');
    if (!content.includes('commandguard_check')) {
      fs.appendFileSync(rcPath, hook);
      console.log(chalk.green('✅ Hook installed in ' + rcFile));
    } else {
      console.log(chalk.yellow('⚠️  Already installed'));
    }
  } else {
    fs.writeFileSync(rcPath, hook);
    console.log(chalk.green('✅ Created ' + rcFile));
  }
}
