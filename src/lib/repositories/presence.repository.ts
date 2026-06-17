export interface PresenceRepository {
  heartbeat(userId: string, meta: { ip?: string; userAgent?: string }): Promise<void>;
  /** active sessions seen within the last N minutes */
  countActive(withinMinutes: number): Promise<number>;
  revoke(userId: string): Promise<void>;
}
