const bcrypt = require('bcryptjs');
const Cryptr = require('cryptr');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');

const SGEController = require('./sgeController');
const User = require('../models/User');

const cryptr = new Cryptr(process.env.CRYPTR);


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
                    message: 'User already exists'
                }]
            });
        }

        // Validar contra el SGE

        // let sgeUser = await SGEController.verify(email);
        // if (!sgeUser) {
        //     res.status(400).json({
        //         errors: [{
        //             message: "Can't find a user on SGE with that email"
        //         }]
        //     });
        // }
        let role = 1;

        user = new User({ email, password, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const jsonData = {
            "data": {
                "codeStatus": {
                    "id": user.id,
                    "expiryTime": 16443334433,
                    "prefix": process.env.QR_PREFIX
                },
                "entity": {
                    "accessClearance": 1,
                    "email": user.email,
                    "sites": [1]
                }
            }
        };

        user.qrstring = await cryptr.encrypt(JSON.stringify(jsonData));

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            process.env.JWT_SECRET, 
            { expiresIn: 360000 }, 
            (err, token) => {
                if (err) throw err;
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