export interface ClickAnalyticsEvent {
  urlId: number;

  ip: string;

  userAgent: string;

  referer: string;

  timestamp: Date;
}
