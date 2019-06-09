module.exports = (express) => {
    const router = express.Router();

    const qr = require('./api/qr')(express);
    const users = require('./api/users')(express);
    const auth = require('./api/auth')(express);
    
    router.use('/qr', qr);
    router.use('/users', users);
    router.use('/auth', auth);

    return router;
}