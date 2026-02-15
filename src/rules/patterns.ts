export interface PatternMatch {
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

export function checkPatterns(command: string, parsed: any): PatternMatch | null {
  const patterns: { [key: string]: PatternMatch } = {
    'rm -rf /': { severity: 'critical', message: 'Deletes ENTIRE system' },
    'rm -rf': { severity: 'high', message: 'Recursive deletion - very dangerous' },
    'chmod 777': { severity: 'high', message: 'World-writable permissions' },
    'curl | bash': { severity: 'high', message: 'Executes remote script' },
    'curl | sh': { severity: 'high', message: 'Executes remote script' },
    'wget | bash': { severity: 'high', message: 'Executes remote script' },
    'dd if=/dev/zero': { severity: 'critical', message: 'Disk wipe operation' },
    'mkfs': { severity: 'critical', message: 'Formats disk' },
    'git reset --hard': { severity: 'medium', message: 'Resets git history' },
    'git push -f': { severity: 'medium', message: 'Force push - can lose data' },
    ':(){:|:&};:': { severity: 'critical', message: 'Fork bomb - crashes system' },
    // Windows Patterns
    'del /s /q': { severity: 'critical', message: 'Recursively deletes files without confirmation' },
    'rd /s /q': { severity: 'critical', message: 'Recursively removes directories without confirmation' },
    'Format-Volume': { severity: 'critical', message: 'Formats a drive volume - DATA LOSS' },
    'Remove-Item -Recurse -Force': { severity: 'high', message: 'Powershell recursive delete without confirmation' },
    'Stop-Computer': { severity: 'medium', message: 'Shuts down the computer' }
  };

  for (const [pattern, data] of Object.entries(patterns)) {
    if (command.toLowerCase().includes(pattern.toLowerCase())) {
      return data;
    }
  }
  return null;
}
