import cron from "node-cron";
import { Service } from "typedi";
import { InternService } from "./intern.service";

@Service()
class CronJobService {
  constructor(private readonly internService: InternService) {}

  start() {
    console.log("Starting cron jobs...");

    cron.schedule(
      "0 0 * * *",
      async () => {
        console.log("Cron job started at midnight.");
        try {
          await this.internService.notifyOrgsOfEligibleInterns();
        } catch (error) {
          console.error("Error in cron job:", error);
        }
      },
      {
        timezone: "Europe/Paris", // CET timezone
      }
    );
  }
}

export { CronJobService };
