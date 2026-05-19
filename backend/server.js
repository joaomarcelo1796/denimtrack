const express = require("express");
const cors = require("cors");
const db = require("./database");

const authRoutes = require("./routes/authRoutes");
const processosRoutes = require("./routes/processosRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/processos", processosRoutes);

app.get("/", (req, res) => {
    res.send("Servidor DenimTrack funcionando!");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});