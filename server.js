const app = require("./src/app");
const { port } = require("./src/config/env");

app.listen(port, () => {
  console.log(`GSTSecureX Backend running on port ${port}`);
  console.log(`http://localhost:${port}`);
});