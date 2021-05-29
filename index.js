const express = require("express");
const path = require("path");
const cors = require("cors");

const apiRoutes = require("./routes/api.routes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.use(cors());

app.get("/", function (req, res) {
  res.json({ message: "Memory Game server is up and running!" });
});

app.use("/api", apiRoutes);

//create a server
const server = app.listen(port, function () {
  const host = server.address().address;
  const port = server.address().port;

  console.log("App listening at http://%s:%s", host, port);
});
