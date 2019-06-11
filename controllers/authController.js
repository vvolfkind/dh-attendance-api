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

module.exports = {
    authenticate
}