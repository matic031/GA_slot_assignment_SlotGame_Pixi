const express = require('express');
const app = express();
const port = 3000;

// Serve static files from the root folder
app.use(express.static(__dirname));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});