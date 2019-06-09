const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');
const SGEController = require('./sgeController');

const User = require('../models/User');

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

        user = new User({ email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
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
                res.json({
                    token
                });
            }
        );
    // !End register process try
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

}


module.exports = {
    register
}