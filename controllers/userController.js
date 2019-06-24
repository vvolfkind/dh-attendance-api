const bcrypt = require("bcryptjs");
const Cryptr = require("cryptr");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const request = require("request");
const validator = require("validator");

const { validationResult } = require("express-validator/check");

const SGE = require("./sgeController");

const User = require("../models/User");
const VerificationToken = require("../models/VerificationToken");
const QrCode = require("../models/QrCode");
const { respond, log } = require("../helpers");

const cryptr = new Cryptr(process.env.CRYPTR);

const generateJsonData = (user, expiryTime, clearanceLevel, sites) => {
  let json = {
    data: {
      codeStatus: {
        id: user._id,
        expiryTime: expiryTime,
        prefix: process.env.QR_PREFIX
      },
      entity: {
        accessClearance: clearanceLevel,
        email: user.email,
        sites: sites
      }
    }
  };

  return json;
};

const dbControl = async email => {
  let user = await User.findOne({ email });
  if (user) {
    let res = await User.remove({ _id: user._id });
    return res.deletedCount;
  }
};

const register = async (req, res) => {
  let user;
  const response = {};
  const { email, password, cpassword } = req.body;

  const mailingURL = process.env.DH_MAILING_URL;

  try {
    user = await User.findOne({ email });
    if (user) {
      response.error = "El email ya existe";
      throw new Error(response.error);
    }

    let alumnee = await SGE(email);

    if (!alumnee) {
      response.error =
        "Email no registrado. Asegurate que sea el que solemos contactarte. Si pensas que hay un error, comunicate con el departamento de Alumnos.";
      throw new Error(response.error);
    }

    let role = 1;

    user = new User({ email, password, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    // Definir roles, duraciones, sedes!
    const jsonData = generateJsonData(user, 1650000000, 1, [1, 2]);
    console.log(jsonData);
    const encrypted = await cryptr.encrypt(JSON.stringify(jsonData));

    let qrCode = new QrCode({
      _userId: user._id,
      code: encrypted
    });
    await qrCode.save();

    let verificationToken = new VerificationToken({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });
    await verificationToken.save();

    let form = {
      qr_charla: verificationToken.token,
      inscripcion_email: email,
      inscripcion_interes: "TEST-DEV-QR-Key",
      contacto_motivo: "TEST-DEV-QR-Key",
      inscripcion_nombre_completo: "TEST-DEV-QR-Key",
      LEADSOURCE: ""
    };

    await request.post(
      { url: mailingURL, form: form },
      (requestError, requestResponse) => {
        if (requestError) throw new Error(requestError);
        response.data = "ok";
        response.code = 200;
        response.message = "success";
        respond(res, response);
      }
    );
    // !End register process try
  } catch (err) {
    console.error(err.message);
    if (response.error) {
      response.code = 400;
      response.message = response.error;
      respond(res, response);
    } else {
      respond(res, {
        code: 500,
        message: err
      });
    }
  }
};

const resetVerificationToken = async (req, res) => {
  const email = req.query.email;

  const response = {};
  let user;

  try {
    user = await User.findOne({ email: email });

    if (!user) {
      response.error = "El email no esta registrado.";
      throw new Error(response.error);
    }

    let verificationToken = await new VerificationToken({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex")
    });
    await verificationToken.save();

    let form = {
      qr_charla: verificationToken.token,
      inscripcion_email: email,
      inscripcion_interes: "TEST-DEV-QR-Key",
      contacto_motivo: "TEST-DEV-QR-Key",
      inscripcion_nombre_completo: "TEST-DEV-QR-Key",
      LEADSOURCE: ""
    };

    const mailingURL = process.env.DH_MAILING_URL;

    await request.post({ url: mailingURL, form: form }, (reqErr, reqRes) => {
      if (reqErr) throw new Error(reqErr);
      response.data = "ok";
      response.code = 200;
      response.message =
        "Link de activacion re-enviado. Es valido dentro de las proximas 6 horas.";
      respond(res, response);
    });
  } catch (err) {
    if (response.error) {
      response.code = 400;
      response.message = response.error;
      respond(res, response);
    } else {
      respond(res, {
        code: 500,
        message: err,
        error: err
      });
    }
  }
};

const index = async (req, res) => {
  let response = {};
  try {
    response.data = await User.find({});
    respond(res, response);
  } catch (err) {
    console.error(err.message);
    respond(res, {
      code: 500,
      message: err
    });
  }
};

const show = async (req, res) => {
  let user;
  let response;

  try {
    response.data = await User.findById(req.query.id);
  } catch (err) {
    console.error(err.message);
    respond(res, {
      code: 500,
      message: err
    });
  }

  if (!user) {
    respond(res, {
      code: 404,
      message: err
    });
  }

  respond(res, response);
};

module.exports = {
  register,
  index,
  show,
  resetVerificationToken
};
