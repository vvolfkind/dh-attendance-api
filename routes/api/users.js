module.exports = (express) => {
    const router = express.Router();

    const userController = require('../../controllers/userController');
    const auth = require('../../middleware/auth');

    router.post('/', userController.register);

    router.get('/', auth, userController.index);
    //router.get('/', userController.index);

    router.get('/show', auth, userController.show);
    //router.get('/show', userController.show);
    router.get('/resetVerificationToken', userController.resetVerificationToken);

    return router;

}