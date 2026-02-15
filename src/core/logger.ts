import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import dayjs from 'dayjs';

export class Logger {
  private logPath: string;

  constructor() {
    const dir = path.join(os.homedir(), '.commandguard', 'logs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
    this.logPath = path.join(dir, dayjs().format('YYYY-MM-DD') + '.log');
  }

  log(level: string, message: string) {
    const entry = `[${dayjs().format('YYYY-MM-DD HH:mm:ss')}] [${level}] ${message}\n`;
    fs.appendFileSync(this.logPath, entry);
    if (process.env.DEBUG) console.log(entry);
  }
}
