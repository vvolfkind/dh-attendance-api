module.exports = (express) => {
    const router = express.Router();

    const qrController = require('../../controllers/qrController');

    // TO DO: JWT + middleware para que sean rutas privadas.

    router.get('/encodeJson', qrController.encodeJsonBodyRequest)
    router.get('/encodeString', qrController.encodeStringRequest)
    router.get('/decrypt', qrController.decryptRequestAndReturnJson)
    router.get('/renderQR', qrController.renderQrRequest)

    return router;

}