import 'dotenv/config';
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import cron from "node-cron";
import { initIO } from "./libs/socket";
import logger from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import Company from "./models/Company";
import BullQueue from './libs/queue';

import { startQueueProcess } from "./queues";
import ProcessExpiredLaneTimersJob from "./services/TicketServices/ProcessExpiredLaneTimersJob";
// import { ScheduledMessagesJob, ScheduleMessagesGenerateJob, ScheduleMessagesEnvioJob, ScheduleMessagesEnvioForaHorarioJob } from "./wbotScheduledMessages";

// === AJUSTES PARA NOVA INSTALAÇÃO ===
// Fallback de porta e host explícito para evitar conflito e facilitar proxy/PM2
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, async () => {
  const companies = await Company.findAll({
    where: { status: true },
    attributes: ["id"]
  });

  const allPromises: any[] = [];
  companies.map(async c => {
    const promise = StartAllWhatsAppsSessions(c.id);
    allPromises.push(promise);
  });

  Promise.all(allPromises).then(async () => {
    await startQueueProcess();
  });

  if (process.env.REDIS_URI_ACK && process.env.REDIS_URI_ACK !== '') {
    BullQueue.process();
  }

  logger.info(`Server started on ${HOST}:${PORT}`);
});

process.on("uncaughtException", err => {
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message);
  console.error(err.stack);
  
});

process.on("unhandledRejection", (reason, p) => {
  console.error(
    `${new Date().toUTCString()} unhandledRejection:`,
    reason,
    p
  );  
});

// cron.schedule("* * * * * *", async () => {

//   try {
//     // console.log("Running a job at 5 minutes at America/Sao_Paulo timezone")
//     await ScheduledMessagesJob();
//     await ScheduleMessagesGenerateJob();
//   }
//   catch (error) {
//     logger.error(error);
//   }

// });

// cron.schedule("* * * * * *", async () => {

//   try {
//     // console.log("Running a job at 01:00 at America/Sao_Paulo timezone")
//     console.log("Running a job at 2 minutes at America/Sao_Paulo timezone")
//     await ScheduleMessagesEnvioJob();
//     await ScheduleMessagesEnvioForaHorarioJob()
//   }
//   catch (error) {
//     logger.error(error);
//   }

// });

// 🎯 KANBAN: Processar timers de lane expirados a cada minuto
cron.schedule("* * * * *", async () => {
  try {
    await ProcessExpiredLaneTimersJob();
  } catch (error) {
    logger.error("❌ [Cron] Erro ao executar ProcessExpiredLaneTimersJob:", error);
  }
});

initIO(server);
gracefulShutdown(server);
