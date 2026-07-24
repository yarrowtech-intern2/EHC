import { Controller, Get, Headers } from "@nestjs/common";

import { AdminAnalyticsService } from "./admin-analytics.service";

@Controller("admin/analytics")
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  @Get("overview")
  getOverview(@Headers("authorization") authorization: string | undefined) {
    return this.adminAnalyticsService.getOverview(authorization);
  }
}
