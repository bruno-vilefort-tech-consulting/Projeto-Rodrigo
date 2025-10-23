import Redis, { RedisOptions } from "ioredis";

/**
 * Monta o cliente Redis aceitando múltiplas formas de configuração:
 * 1) URI completa: IO_REDIS_URI | REDIS_URI | REDIS_URL
 * 2) Parâmetros soltos: REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB
 *
 * Default atual: host 127.0.0.1 e PORTA 5001 (se nada for informado).
 */
function createRedis(): Redis {
  const uri =
    process.env.IO_REDIS_URI ||
    process.env.REDIS_URI ||
    process.env.REDIS_URL ||
    "";

  // Opções comuns seguras para ioredis em apps Node com PM2/cluster
  const common: RedisOptions = {
    // ajuste de timeouts/retries se quiser algo mais agressivo
    // maxRetriesPerRequest: null,
    // enableReadyCheck: true,
  };

  if (uri) {
    return new Redis(uri, common);
  }

  const host = process.env.REDIS_HOST || "127.0.0.1";
  const port = Number(
    process.env.IO_REDIS_PORT ||
      process.env.REDIS_PORT ||
      5001 // << default 5001 como você pediu
  );
  const password = process.env.REDIS_PASSWORD || undefined;
  const db =
    process.env.REDIS_DB !== undefined ? Number(process.env.REDIS_DB) : undefined;

  return new Redis(
    {
      host,
      port,
      password,
      db,
      ...common
    }
  );
}

const redis = createRedis();

// chave do lock para “menu de boas-vindas”
const k = (id: number | string) => `flow:lock:welcome:${id}`;

/**
 * Tenta adquirir um lock por ticket por alguns segundos (TTL).
 * Se conseguir, retorna true; se já houver lock ativo, retorna false.
 */
export async function acquireTicketWelcomeLock(
  ticketId: number,
  ttlSec = Number(process.env.FLOW_MENU_COOLDOWN_SEC || 8)
): Promise<boolean> {
  try {
    // SET key NX EX ttl  => só cria se não existir e expira sozinho
    const res = await redis.set(k(ticketId), "1", "EX", ttlSec, "NX");
    return res === "OK";
  } catch (err) {
    console.error("Redis lock error:", err);
    // Em caso de erro no Redis, não travar o fluxo por completo:
    // retorne true para deixar o atendimento seguir (ou mude p/ false se preferir bloquear).
    return true;
  }
}


