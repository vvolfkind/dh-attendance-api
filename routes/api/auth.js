module.exports = express => {
  const router = express.Router();

  const authController = require("../../controllers/authController");

  router.post("/", authController.authenticate);

  router.get("/verify", authController.verifyAccount);
  
  router.get("/check", authController.checkJwt);

  return router;
};
