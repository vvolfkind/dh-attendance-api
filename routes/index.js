module.exports = (app, express) => {
  const cors = require("cors");
  app.use(cors());
  app.use(express.json());

  const v1 = require("./v1")(express);

  app.use("/v1", v1);
};
