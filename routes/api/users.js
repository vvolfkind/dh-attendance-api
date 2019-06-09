module.exports = (express) => {
    const router = express.Router();
    const { check, validationResult } = require('express-validator/check');

    const userController = require('../../controllers/userController');

    /**
     * 
     * @route   POST api/users
     * @desc    Register user
     * @access  Public
     * 
     */
    router.post('/', [
        check('email', 'Invalid Email')
        .isEmail(),
        check('password', 'Password must have 6 or more characters')
        .isLength(6)
    ], userController.register);


    return router;
}