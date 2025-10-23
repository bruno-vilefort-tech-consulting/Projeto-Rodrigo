export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "7d", // ✅ Access token: 7 dias (antes: 15 minutos)
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "30d" // ✅ Refresh token: 30 dias (antes: 7 dias)
};
