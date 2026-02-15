import chalk from 'chalk';
import boxen from 'boxen';

export async function showDashboard(db: any, days: number) {
  const stats = db.getStatistics(days);
  const safetyScore = Math.max(0, 100 - (stats.blockedCommands * 5));
  const scoreColor = safetyScore > 90 ? 'green' : safetyScore > 70 ? 'yellow' : 'red';

  const content = `
${chalk.bold('Stats for last ' + days + ' days')}

🛡️  Safety Score: ${chalk[scoreColor](safetyScore + '/100')}

📊 Total Commands:   ${chalk.white(stats.totalCommands)}
⛔ Blocked:          ${chalk.red(stats.blockedCommands)}
🎉 Saved:            ${chalk.green(stats.blockedCommands)} disasters prevented

${chalk.gray('─────────────────────────────')}

${chalk.bold('Recent Interventions:')}
${stats.recentBlocks?.map((cmd: any) => `${chalk.red('✖')} ${cmd.command} (${chalk.gray(new Date(cmd.timestamp).toLocaleDateString())})`).join('\n') || chalk.gray('None (Good job!)')}
  `;

  console.log(boxen(content, {
    padding: 1,
    borderStyle: 'round',
    borderColor: scoreColor,
    title: 'CommandGuard Dashboard',
    titleAlignment: 'center',
    margin: 1
  }));
}
