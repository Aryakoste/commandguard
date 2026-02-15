import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';

export async function analyzeCommand(command: string, analyzer: any, verbose: boolean) {
  const spinner = ora('Analyzing...').start();
  const result = await analyzer.analyze(command);
  spinner.stop();

  const severityColors: { [key: string]: string } = {
    critical: 'red',
    high: 'red',
    medium: 'yellow',
    low: 'blue',
    safe: 'green'
  };

  const color = severityColors[result.severity as string] || 'white';
  const emoji = ({ 'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🔵', 'safe': '🟢' } as any)[result.severity] || '⚪';

  console.log(boxen(
    `${chalk.bold(emoji + ' ' + result.severity.toUpperCase())}\n\n${chalk.white(result.command)}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: color as any,
      title: 'Command Analysis',
      titleAlignment: 'center'
    }
  ));

  const chalkColor = (chalk as any)[color] || chalk.white;
  console.log(chalkColor(`  ${chalk.bold('Explanation')}: ${result.explanation}`));

  if (result.alternatives && result.alternatives.length > 0) {
    console.log('\n' + chalk.cyan.bold('  💡 Alternatives:'));
    result.alternatives.forEach((a: string, i: number) => {
      console.log(chalk.cyan(`    ${i + 1}. ${a}`));
    });
  }
}
