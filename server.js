const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = 3001;

app.get("/fetch-wikipedia", async (req, res) => {
  const title = req.query.title;
  const url = `https://ja.wikipedia.org/w/api.php?action=query&prop=extracts&titles=${title}&exintro&explaintext&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).send("Error fetching data from Wikipedia");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
