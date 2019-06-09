module.exports = (express) => {
    const router = express.Router();
    const { check, validationResult } = require('express-validator/check');

    const userController = require('../../controllers/userController');
    const auth = require('../../middleware/auth');

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

    /**
     * 
     * @route   GET api/users
     * @desc    Retrieves users
     * @access  Private
     * 
     */
    router.get('/', auth, userController.index);

    /**
     * 
     * @route   GET api/user/show
     * @desc    Retrieves single user
     * @access  Private
     * 
     */
    router.get('/show', userController.show);



    return router;
}