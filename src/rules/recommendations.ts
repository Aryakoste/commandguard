export function getRecommendations(command: string, parsed: any): string[] {
  if (command.includes('rm -rf /')) {
    return ['rm -rf ./build', 'rm -rf ~/Downloads/*', 'git clean -fd'];
  }
  if (command.includes('chmod 777')) {
    return ['chmod 755', 'chmod 644'];
  }
  if (command.includes('curl |')) {
    return ['curl url > script.sh', 'cat script.sh', 'bash script.sh'];
  }
  if (command.includes('git reset --hard')) {
    return ['git reset --soft HEAD~1', 'git stash', 'git checkout -- .'];
  }
  // Windows Recommendations
  if (command.toLowerCase().includes('del /s /q')) {
    return ['del /p', 'Move-Item source destination'];
  }
  if (command.toLowerCase().includes('rd /s /q')) {
    return ['rd /s', 'Remove-Item -Recurse'];
  }
  if (command.toLowerCase().includes('format-volume')) {
    return ['Get-Volume', 'Repair-Volume'];
  }
  return [];
}
