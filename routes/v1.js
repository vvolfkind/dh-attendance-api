module.exports = (express) => {
    const router = express.Router();

    const qr = require('./api/qr')(express);
    const users = require('./api/users')(express);

    router.use('/qr', qr);
    router.use('/users', users);

    return router;
}