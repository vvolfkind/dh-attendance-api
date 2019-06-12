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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        // Si el email existe, rebota
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ 
                errors: [{ 
                    message: 'El email ya esta registrado en nuestra base de datos.' 
                }] 
            });
            return false;
        }

        let role = 1;

        user = new User({ email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const jsonData = generateJsonData(user, 1650000000, 1, [1, 2]);
        user.qrstring = await cryptr.encrypt(JSON.stringify(jsonData));

        let verificationToken = new VerificationToken({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        });

        await verificationToken.save();

        sendActivationEmail(user.email, verificationToken);
        res.status(200).send();

    // !End register process try
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

};

const verify = (req, res) => {

}
/**
 * @param {string} email
 * Metodo provisorio para aprovechar el envio de mails de Zoho
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

    request.post({ url: url, form: form }, function(err, res, body) {
        if(err) {
            console.log(err);
        }
        console.log(res.body);
    });
}

const index = async (req, res) => {
    try {
        let users = await User.find({});
        res.json({ users });
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

};

const show = async (req, res) => {
    let user;

    try {
        user = await User.findById(req.query.id)
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

    if (!user) {
        res.status(404).send('User not found');
    }

    res.json({ user });

};


module.exports = {
    register,
    index,
    verify,
    show
}