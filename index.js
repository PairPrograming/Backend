const server = require("./src/app.js");
const { conn } = require("./src/DbIndex.js");

conn.sync({ force: false }).then(() => {
  server.listen(4000, () => {
    console.log("%s listening at 4000");
  });
});
