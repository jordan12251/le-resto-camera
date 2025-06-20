require("dotenv").config();
const path = require("path");
const fs = require("fs");
const fastify = require("fastify")({ logger: false });
const multer = require("fastify-multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const upload = multer.memoryStorage(); // Enregistre dans la mÃ©moire
fastify.register(multer.contentParser);
fastify.register(multer, { storage: upload });

const botToken = process.env.BOT_TOKEN;

fastify.post("/upload", async (req, reply) => {
  const data = await req.file();

  if (!data) {
    return reply.status(400).send({ error: "Aucune image reÃ§ue." });
  }

  const { uid } = req.query;
  if (!uid || !botToken) {
    return reply.status(400).send({ error: "UID ou token manquant." });
  }

  const form = new FormData();
  form.append("chat_id", uid);
  form.append("photo", data.file, { filename: "capture.jpg" });

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

  try {
    const response = await fetch(telegramUrl, {
      method: "POST",
      body: form,
    });

    const json = await response.json();
    reply.send(json);
  } catch (err) {
    console.error("Erreur Telegram:", err);
    reply.status(500).send({ error: "Erreur lors de l'envoi Ã  Telegram." });
  }
});

fastify.listen({ port: process.env.PORT || 3000 }, (err) => {
  if (err) throw err;
  console.log("Serveur dÃ©marrÃ© sur le port 3000");
});
