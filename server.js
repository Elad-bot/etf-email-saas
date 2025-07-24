// Basic express server (optional for health checks)

import express from "express";
const app = express();

app.get("/", (req, res) => {
  res.send("ETF email service is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
