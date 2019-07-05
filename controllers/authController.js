const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const QRCode = require("../models/QrCode");
const { respond, log } = require("../helpers");

const authenticate = async (req, res) => {
  const response = {};

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.error("Login fail. I recieved: ", email, password);
      response.message = "Email o password incorrectos";
      throw new Error(response.message);
    } else if (user.isVerified == false) {
      response.message =
        "La cuenta no esta activada. Revisa tu casilla de email";
      throw new Error(response.message);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.error('Password match error: ', isMatch)
      response.message = "Email o password incorrectos.";
      throw new Error(response.message);
    }

    const qrCode = await QRCode.findOne({ _userId: user._id });

    if (!qrCode) {
      console.error("QR Not Found: ", qrCode);
      response.message = "Error en el servidor";
      throw new Error(response.message);
    }

    const payload = {
      user: {
        id: user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw new Error(err);
        response.code = 200;
        response.data = {
          jwt: token,
          email: user.email,
          qrcode: qrCode.code
        };
        respond(res, response);
      }
    );
  } catch (err) {
    console.error(err.message);
    response.code = 400;
    respond(res, response);
  }
};

const verifyAccount = async (req, res, next) => {
  const { email, token } = req.query;
  const response = {};
  let user;
  let dbToken;

  try {
    dbToken = await VerificationToken.findOne({ token });
    user = await User.findOne({ _id: dbToken._userId });

    if (dbToken && user) {
      user.isVerified = true;
      await user.save();
      await VerificationToken.deleteOne({ _id: dbToken._id });
      return res.redirect(301, "/attendance/login");
    } else {
      response.error = "Email inexistente o token de verificación inválido.";
      throw new Error(response.error);
    }
  } catch (err) {
    if (response.error) {
      response.code = 400;
      response.message = response.error;
      respond(res, response);
    } else {
      response.code = 400;
      response.message = response.error;
      respond(res, response);
    }
  }
};

const checkJwt = async (req, res) => {
  try {
    const token = await jwt.verify(req.query.token, process.env.JWT_SECRET);
    if (!token) throw new Error();
    if (!token.exp * 1000 <= Date.now()) {
      respond(res, {
        code: 200,
        message: "success",
        data: "ok"
      });
    } else {
      throw new Error();
    }
  } catch (err) {
    respond(res, {
      code: 403,
      message: err
    });
  }
};

module.exports = {
  authenticate,
  verifyAccount,
  checkJwt
};
