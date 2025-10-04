const express = require("express");
const path = require("path");
const app = express();

// serve os arquivos estáticos do build do React
app.use(express.static(path.join(__dirname, "build")));

// rota fallback: qualquer path retorna index.html

  // Fallback para SPA - todas as rotas retornam index.html
  app.use((req, res) => {
      res.sendFile(path.join(__dirname, "build", "index.html"));
  });

// === AJUSTE IMPORTANTE ===
// Porta vem do .env ou usa 3001 como fallback
const PORT = Number(process.env.SERVER_PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Frontend server running on http://${HOST}:${PORT}`);
});
