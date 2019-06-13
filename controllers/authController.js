const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const { respond, log } = require('../helpers')

const authenticate = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                errors: [{ 
                    message: 'Invalid Credentials' 
                }]
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                errors: [{ 
                    message: 'Invalid Credentials' 
                }]
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        let qrstring = user.qrstring;
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, qrstring});
            }
        );

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }

}

const activateAccount = async (user) => {
    user.isVerified = true;
    user.save((err) => {
        if (err) throw err;
        return true;
    })
} 


const verifyAccount = async (req, res, next) => {
// url: http://localhost:5000/v1/verify?email=rofo@dh.com&token=1234567899
    const {email, token} = req.query;
    let user;

    try {
        let dbToken = await VerificationToken.findOne({ token });
        if (!dbToken) {
            return res.status(400).json({
                errors: [{
                    message: 'Invalid Token'
                }]
            });
        }

        userId = dbToken._userId;
        user = await User.findById(userId);
        console.log(user);
        if(user) {
            user.isVerified = true;
            user.save((err) => {
                if (err) throw err;
                return res.status(200).send("Cuenta verificada");
            });
        } else {
            throw "User not found";
        }
    } catch(err) {
        console.error(err);
        return res.status(500).send({
            'error': 'Server Error'
        })
    }

    VerificationToken.findOne({ token: token }, (err, token) => {
        if (!token) {
            return res.status(400).send({ 
                type: 'not-verified', 
                msg: 'Invalid or expider token' 
            });
        }

    });

    const JWTPayload = {
        user: {
            id: user._id
        }
    }

    res.status(200).send();

    jwt.sign(JWTPayload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_DURATION
        },
        (err, token) => {
            if (err) throw err;
            res.json({
                token
            });

        }
    );
}

module.exports = {
    authenticate,
    verifyAccount
}