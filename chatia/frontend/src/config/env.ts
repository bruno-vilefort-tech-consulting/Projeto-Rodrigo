// Configuração centralizada de variáveis de ambiente
// IMPORTANTE: Use apenas notação de ponto (process.env.REACT_APP_X) para permitir
// que o webpack faça replace estático em tempo de build

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL as string;
export const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID ?? "";
export const REQUIRE_BUSINESS_MANAGEMENT =
  (process.env.REACT_APP_REQUIRE_BUSINESS_MANAGEMENT ?? "FALSE").toUpperCase() === "TRUE";
export const NAME_SYSTEM = process.env.REACT_APP_NAME_SYSTEM ?? "ChatIA";
export const NUMBER_SUPPORT = process.env.REACT_APP_NUMBER_SUPPORT ?? "";
export const HOURS_CLOSE_TICKETS_AUTO = process.env.REACT_APP_HOURS_CLOSE_TICKETS_AUTO ?? "1";
export const PRIMARY_COLOR = process.env.REACT_APP_PRIMARY_COLOR ?? "#10aa62";
export const PRIMARY_DARK = process.env.REACT_APP_PRIMARY_DARK ?? "#0d8b4f";

// Fail fast em produção se faltarem variáveis críticas
if (!BACKEND_URL) {
  throw new Error("REACT_APP_BACKEND_URL ausente no build.");
}
