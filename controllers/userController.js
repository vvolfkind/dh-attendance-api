const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const crypto = require('crypto');
const FormData = require('form-data');
const jwt = require('jsonwebtoken');
const request = require('request');

const { validationResult } = require('express-validator/check');

const SGEController = require('./sgeController');
const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { respond, log } = require('../helpers')

const cryptr = new Cryptr(process.env.CRYPTR);

/**
 * @param {Mongoose Schema} user 
 * @param {string} expiryTime 
 * @param {integer} clearanceLevel 
 * @param {array} sites 
 * @returns {json}
 */


const generateJsonData = (user, expiryTime, clearanceLevel, sites) => {
    let json = {};

    json.codeStatus = {
        "id": user.id,
        "expiryTime": expiryTime,
        "prefix": process.env.QR_PREFIX
    }

    json.entity = {
        "accessClearance": clearanceLevel,
        "email": user.email,
        "sites": sites
    }

    return json
}

/**
 * Control de falsos registros. Si el email no se encuentra en el SGE,
 * se borra el registro de la base de datos.
 * @param {string} email
 * @returns {integer} Schema deleted count
 * 
 */
const dbControl = async (email) => {
    let user = await User.findOne({ email });
    if (user) {
        let res = await User.remove({_id: user._id});
        return res.deletedCount;
    }
}




const register = async (req, res) => {
    let user;
    const response = {};
    const errors = validationResult(req);
    const { email, password } = req.body;
    const mailingURL = process.env.DH_MAILING_URL;

    try {
        if (!errors.isEmpty()) {
            response.error = "Datos Erroneos";
            throw new Error("Datos Erroneos");
        }
 
        user = await User.findOne({ email });
        if (user) {
            response.error = "El email ya existe";
            throw new Error("El email ya existe");
        }

        let role = 1;

        user = new User({ email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
// Definir roles, duraciones, sedes!
        const jsonData = generateJsonData(user, 1650000000, 1, [1, 2]);
        user.qrstring = await cryptr.encrypt(JSON.stringify(jsonData));

        let verificationToken = new VerificationToken({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });
        await verificationToken.save();

        let form = {
            'qr_charla': verificationToken.token,
            'inscripcion_email': email,
            'inscripcion_interes': 'Dev - DH QR Key',
            'contacto_motivo': 'Dev - DH QR Key',
            'inscripcion_nombre_completo': 'Dev - DH QR Key',
            'LEADSOURCE': 'Orgánico'
        }

        await request.post({ url: mailingURL, form: form }, (err, res) => {
            if(err) throw err;
            respond(res, {
                "code": 200,
                "message": "success"
            });
        });
    // !End register process try
    } catch (err) {
        console.error(err.message);
        if(response.error) {
            response.code = 400;
            response.message = response.error;
            respond(res, response);
        } else {
            respond(res, {
                "code": 500,
                "message": err
            });
        }

    }

};

/**
 * @param {string} email
 * @param {string} token
 * Metodo provisorio para aprovechar el envio de mails de Zoho
 * y asi enviar el email de activacion de cuenta
 * 
 */
const sendActivationEmail = (email, token) => {
    const url = process.env.DH_MAILING_URL;
    let form = {
        'qr_charla': token.token,
        'inscripcion_email': email,
        'inscripcion_interes': 'Dev - DH QR Key',
        'contacto_motivo': 'Dev - DH QR Key',
        'inscripcion_nombre_completo': 'Dev - DH QR Key',
        'LEADSOURCE': 'Orgánico'
    }

    request.post({ url: url, form: form }, (err, res) => {
        if(err) respond(res, { "code": 500, "message": err });
        respond(res, {
            "code": 200,
            "message": "success"
        });
    });
}

/**
 * 
 * @param {http request} req 
 * @param {http response} res 
 * Indexes all users
 * 
 */
const index = async (req, res) => {
    let response = {};
    try {
        response.data = await User.find({});
        respond(res, response);
    } catch(err) {
        console.error(err.message);
        respond(res, {
            "code": 500,
            "message": err
        });
    }

};

/**
 * 
 * @param {http request} req 
 * @param {http response} res 
 * Returns a single user found by id
 * 
 */
const show = async (req, res) => {
    let user;
    let response;

    try {
        response.data = await User.findById(req.query.id);
    } catch(err) {
        console.error(err.message);
        respond(res, {
            "code": 500,
            "message": err
        });
    }

    if (!user) {
        respond(res, {
            "code": 404,
            "message": err
        });
    }

    respond(res, response);

};


module.exports = {
    register,
    index,
    show
}