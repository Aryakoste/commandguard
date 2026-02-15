export function parseCommand(command: string) {
  const parts = command.trim().split(/\s+/);
  return {
    base: parts[0] || '',
    flags: parts.filter(p => p.startsWith('-')),
    args: parts.filter(p => !p.startsWith('-')).slice(1)
  };
}
