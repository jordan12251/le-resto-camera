require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/get-token", (req, res) => {
  res.json({ token: process.env.TELEGRAM_TOKEN });
});

app.post("/send-photo", upload.single("photo"), async (req, res) => {
  const filePath = req.file.path;
  const chatId = req.body.chat_id;
  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("photo", fs.createReadStream(filePath));
  try {
    const result = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`, {
      method: "POST",
      body: form,
    }).then(res => res.json());
    fs.unlinkSync(filePath);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur en ligne sur le port", PORT));