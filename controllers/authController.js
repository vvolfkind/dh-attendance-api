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


const verifyAccount = async (req, res, next) => {
    const {email, token} = req.query;
    const response = {};
    let user;
    let dbToken;

    try {
        dbToken = await VerificationToken.findOne({ token });
        user = await User.findOne({ _id: dbToken._userId });

        if (dbToken && user) {
            user.isVerified = true;
            await user.save();
            console.log(user);
            respond(res, {
                "code": 200,
                "message": "success"
            });


        } else {
            response.error = "Email inexistente o token de verificación vencido.";
            throw new Error(response.error);

        }

    } catch(err) {
        if (response.error) {
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
}

module.exports = {
    authenticate,
    verifyAccount
}