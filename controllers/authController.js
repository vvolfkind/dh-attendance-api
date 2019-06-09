const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ errors: [{ message: 'Invalid Credentials' }] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ errors: [{ message: 'Invalid Credentials' }] });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

    jwt.sign(
        payload,
        process.env.JWT_SECRET, {
            expiresIn: 360000
        },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
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