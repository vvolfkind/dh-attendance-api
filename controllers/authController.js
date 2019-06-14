const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const VerificationToken = require('../models/VerificationToken');
const QRCode = require('../models/QrCode');
const { respond, log } = require('../helpers')

const authenticate = async (req, res) => {
    const response = {};

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            response.message = "bad-credentials";
            throw new Error(response.message);
        } else if(user.isVerified == false) {
            response.message = "account-not-verified"
            throw new Error(response.message);
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            response.message = "bad-credentials";
            throw new Error(response.message);
        }

        const qrCode = await QRCode.findOne({_userId: user._id });

        if(!qrCode) {
            response.message = "server-error";
            throw new Error(response.message);
        }

        const payload = {
            user: {
                id: user._id
            }
        }

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 },
            (err, token) => {
                if (err) throw new Error(err);
                response.code = 200;
                response.data = {
                    jwt: token,
                    email: user.email,
                    qrcode: qrCode.code
                }
                respond(res, response);
            }
        );

    } catch (err) {
        console.error(err.message);
        response.code = 400;
        respond(res, response);
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
            respond.code = 200;
            response.data = "success";
            respond(res, response);


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