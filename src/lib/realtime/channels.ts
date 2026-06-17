/** Channel + topic name builders for Supabase Realtime. */
export const channels = {
  /** Per-user: their profile row, notifications, and user-scoped visibility. */
  user: (userId: string) => `user:${userId}`,
  /** Org-wide visibility changes (role/department scope). */
  visibility: () => "org:visibility",
  /** Presence — who's online now. */
  presence: () => "presence:online",
  /** Admin live activity feed (audit inserts). */
  activity: () => "org:activity",
};

export interface PresenceMeta {
  userId: string;
  name: string;
  dept: string;
  online_at: string;
}
