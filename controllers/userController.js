const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');
const mailer = require('./mailingController').mailer

const SGEController = require('./sgeController');
const User = require('../models/User');

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

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURATION }, 
            (err, token) => {
                if (err) throw err;
                try {
                    mailer(token, user.email)
                } catch (error) {
                    console.log(error)
                }
                
                res.json({ token });

            }
        );
    // !End register process try
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

};

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
    show
}