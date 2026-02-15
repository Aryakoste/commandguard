export interface Config {
  riskLevel: 'paranoid' | 'strict' | 'balanced' | 'permissive';
  copilotEnabled: boolean;
}

export const DEFAULT_CONFIG: Config = {
  riskLevel: 'balanced',
  copilotEnabled: false
};
