import SQLite from 'better-sqlite3';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export class Database {
  private db: any;

  constructor() {
    const dir = path.join(os.homedir(), '.commandguard');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    this.db = new SQLite(path.join(dir, 'commandguard.db'));
    this.init();
  }

  private init() {
    this.db.exec(`CREATE TABLE IF NOT EXISTS commands (
      id INTEGER PRIMARY KEY AUTOINCREMENT, command TEXT, severity TEXT,
      explanation TEXT, executed BOOLEAN DEFAULT 0, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS config (key TEXT PRIMARY KEY, value TEXT)`);
    this.db.exec(`CREATE TABLE IF NOT EXISTS whitelist (id INTEGER PRIMARY KEY, pattern TEXT UNIQUE)`);

    const defaults = { 'risk-level': 'balanced', 'copilot-enabled': 'false' };
    Object.entries(defaults).forEach(([k, v]) => {
      if (!this.getConfig(k)) this.setConfig(k, v);
    });
  }

  logCommand(result: any) {
    this.db.prepare('INSERT INTO commands (command, severity, explanation) VALUES (?, ?, ?)')
      .run(result.command, result.severity, result.explanation);
  }

  updateCommandExecution(cmd: string, exec: boolean) {
    this.db.prepare('UPDATE commands SET executed = ? WHERE command = ? AND id = (SELECT MAX(id) FROM commands WHERE command = ?)')
      .run(exec ? 1 : 0, cmd, cmd);
  }

  getStatistics(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const isoSince = since.toISOString();

    const total = this.db.prepare('SELECT COUNT(*) as count FROM commands WHERE timestamp >= ?')
      .get(isoSince)?.count || 0;

    const blocked = this.db.prepare("SELECT COUNT(*) as count FROM commands WHERE executed = 0 AND severity IN ('high', 'critical') AND timestamp >= ?")
      .get(isoSince)?.count || 0;

    const recentBlocks = this.db.prepare("SELECT command, timestamp FROM commands WHERE executed = 0 AND severity IN ('high', 'critical') AND timestamp >= ? ORDER BY timestamp DESC LIMIT 5")
      .all(isoSince);

    return {
      totalCommands: total,
      blockedCommands: blocked,
      recentBlocks: recentBlocks
    };
  }

  setConfig(key: string, value: string) {
    this.db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value);
  }

  getConfig(key: string) {
    const r = this.db.prepare('SELECT value FROM config WHERE key = ?').get(key);
    return r ? r.value : null;
  }

  isWhitelisted(cmd: string) {
    return this.db.prepare('SELECT COUNT(*) as count FROM whitelist WHERE pattern = ?')
      .get(cmd)?.count > 0;
  }

  close() { this.db.close(); }
}
