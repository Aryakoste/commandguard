import inquirer from 'inquirer';

export async function askConfirmation(message: string): Promise<boolean> {
  const answer = await inquirer.prompt([
    {type: 'confirm', name: 'proceed', message, default: false}
  ]);
  return answer.proceed;
}
