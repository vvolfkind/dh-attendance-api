module.exports = (express) => {
    const router = express.Router();

    const userController = require('../../controllers/userController');
    const auth = require('../../middleware/auth');
    const validate = require('../../middleware/validate');

    router.post('/', userController.register);

    //router.get('/', auth, userController.index);
    router.get('/', userController.index);

    //router.get('/show', auth, userController.show);
    router.get('/show', userController.show);


    return router;
}