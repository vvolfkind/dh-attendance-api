const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

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

const verifyAccount = async (req, res, next) => {
// url: http://localhost:5000/v1/verify?email=rofo@dh.com&token=1234567899
    const {email, token} = req.query;

    try {
        let dbToken = await Token.findOne({ token: token });
        if (!dbToken) {
            return res.status(400).json({
                errors: [{
                    message: 'Invalid Token'
                }]
            });
        }
        userId = dbToken._userId;
        let user = await User.findOne({ userId });
    } catch(err) {

    }

    Token.findOne({ token: token }, (err, token) => {
        if (!token) {
            return res.status(400).send({ 
                type: 'not-verified', 
                msg: 'We were unable to find a valid token. Your token my have expired.' 
            });
        }

    });
 
    const JWTPayload = {
        user: {
            id: user.id
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