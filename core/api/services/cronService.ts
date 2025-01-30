import cron from "node-cron";
import { Service } from "typedi";
import { InternService } from "./internService";

@Service()
class CronJobService {
  constructor(private readonly internService: InternService) {}

  start() {
    console.log("Starting cron jobs...");

    cron.schedule("0 0 * * *", async () => {
      console.log("Cron job started at tuesday.");
      try {
        await this.internService.notifyOrgsOfEligibleInterns();
      } catch (error) {
        console.error("Error in cron job:", error);
      }
    });
  }
}

export { CronJobService };
