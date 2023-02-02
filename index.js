const app = require("./src/app");

const port = process.env.PORT;

app.listen(port || 5000, () => {
  console.log("Backend Server is running!");
});

