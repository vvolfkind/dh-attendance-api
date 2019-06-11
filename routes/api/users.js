module.exports = (express) => {
    const router = express.Router();
    const { check, validationResult } = require('express-validator/check');

    const userController = require('../../controllers/userController');
    const auth = require('../../middleware/auth');

    /**
     * 
     * @route   POST v1/users
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

    /**
     * 
     * @route   GET v1/users
     * @desc    Retrieves users
     * @access  Private
     * 
     */
    router.get('/', auth, userController.index);

    /**
     * 
     * @route   GET v1/user/show
     * @desc    Retrieves single user
     * @access  Private
     * 
     */
    router.get('/show', userController.show);



    return router;
}