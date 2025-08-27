// Drizzle schema (lightweight). בטבלאות Firewall rules.
export type Protocol = 'tcp' | 'udp';
export type Action = 'allow' | 'deny';

export interface Rule {
  id: number;
  source_ip: string;
  dest_ip: string;
  port: number;
  protocol: Protocol;
  action: Action;
  created_at: Date;
}
