module.exports = (express) => {
    const router = express.Router();
    const { check, validationResult } = require('express-validator/check');

    const User = require('../../models/User');
    const auth = require('../../middleware/auth');
    const authController = require('../../controllers/authController');


    /**
     * 
     * @route   POST api/auth
     * @desc    Authenticate User and get Token
     * @access  Public
     * 
     */
    router.post('/', authController.authenticate);

    /**
     * 
     * @route   GET api/auth
     * @desc    Verify JWT
     * @access  Public
     * 
     */
    router.get('/', auth, async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select('-password');
            res.json(user);

        } catch(err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    });


    return router;

}