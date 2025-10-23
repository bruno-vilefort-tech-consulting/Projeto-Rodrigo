const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Serve arquivos estáticos do diretório atual (já estamos em build/)
app.use(express.static(__dirname));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.SERVER_PORT || 3000;

app.listen(PORT, () => {
  console.log("Frontend running on port " + PORT);
});
