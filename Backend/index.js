const express = require('express');

const app = express();

app.get("/", (req, res) => {
  res.send("Server deployed and running on vercel.");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});