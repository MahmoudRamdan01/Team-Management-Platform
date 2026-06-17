import type { Notification } from "./types";

export interface CreateNotificationInput {
  userId: string | null;
  type?: string;
  titleEn: string;
  titleAr: string;
  bodyEn?: string;
  bodyAr?: string;
  data?: Record<string, unknown>;
}

export interface NotificationRepository {
  listForUser(userId: string, limit?: number): Promise<Notification[]>;
  unreadCount(userId: string): Promise<number>;
  markRead(id: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  create(input: CreateNotificationInput): Promise<Notification>;
  createMany(inputs: CreateNotificationInput[]): Promise<number>;
}
