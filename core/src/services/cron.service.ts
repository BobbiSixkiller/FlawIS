import cron from "node-cron";
import { Service } from "typedi";
import { ReviewService } from "./reviews/review.service";
import { InternService } from "./internships/intern.service";

@Service()
class CronJobService {
  constructor(
    private readonly internService: InternService,
    private readonly reviewService: ReviewService,
  ) {}

  start() {
    console.log("Starting cron jobs...");

    cron.schedule(
      "15 * * * *",
      () =>
        this.reviewService
          .reminders()
          .catch((error) =>
            console.error("Review reminders failed:", error.message),
          ),
      { timezone: "Europe/Bratislava" },
    );

    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("Cron job started at midnight.");
        try {
          await this.internService.notifyOrgsOfEligibleInterns();
          await this.internService.notifyAdminsOfAppliedInterns();
        } catch (error) {
          console.error("Error in cron job:", error);
        }
      },
      {
        timezone: "Europe/Paris", // CET timezone
      },
    );
  }
}

export { CronJobService };
