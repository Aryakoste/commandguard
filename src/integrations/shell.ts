import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import { execSync } from 'child_process';

export async function installHooks() {
  const isWindows = process.platform === 'win32';

  if (isWindows) {
    await installPowerShellHook();
    return;
  }

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
      console.log(chalk.yellow('⚠️  Already installed in ' + rcFile));
    }
  } else {
    fs.writeFileSync(rcPath, hook);
    console.log(chalk.green('✅ Created ' + rcFile));
  }
}

async function installPowerShellHook() {
  try {
    // Get PowerShell profile path
    const profilePath = execSync('powershell -NoProfile -Command "echo $PROFILE"', { encoding: 'utf-8' }).trim();

    if (!profilePath) {
      console.error(chalk.red('❌ Could not determine PowerShell profile path.'));
      return;
    }

    // Ensure directory exists
    const profileDir = path.dirname(profilePath);
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    const hookScript = `
# CommandGuard Hook
if (Get-Command commandguard -ErrorAction SilentlyContinue) {
    Set-PSReadLineKeyHandler -Key Enter -ScriptBlock {
        $line = $null
        $cursor = $null
        [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cursor)
        
        if ($line -and $line.Trim().Length -gt 0) {
            # Run interception
            commandguard intercept $line
            if ($LASTEXITCODE -eq 0) {
                [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
            } else {
                # Setup specific checks or just return to prompt without executing
                Write-Host "🚫 Command Intercepted" -ForegroundColor Red
            }
        } else {
            [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
        }
    }
}
`;

    if (fs.existsSync(profilePath)) {
      const content = fs.readFileSync(profilePath, 'utf-8');
      if (content.includes('CommandGuard Hook')) {
        console.log(chalk.yellow(`⚠️  Already installed in ${profilePath}`));
        return;
      }
      fs.appendFileSync(profilePath, '\n' + hookScript);
    } else {
      fs.writeFileSync(profilePath, hookScript);
    }

    console.log(chalk.green(`✅ PowerShell hook installed in ${profilePath}`));
    console.log(chalk.blue('ℹ️  Run ". $PROFILE" or restart your terminal to activate.'));

  } catch (error: any) {
    console.error(chalk.red('❌ Failed to install PowerShell hook: ' + error.message));
  }
}
