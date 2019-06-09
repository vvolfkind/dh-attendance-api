module.exports = (express) => {
    const request = require('request');
    const { respond } = require('../helpers')
    const router = express.Router();
    const sgeUrl = "https://sge.digitalhouse.com/api/qr/student/validate?email=";

    router.get('/verify', async (req, res) => {
        const email = req.query.email;

        request.get("https://sge.digitalhouse.com/api/qr/student/validate?email=${`email`}", (error, response) => {
            if (error)  {
                colsole.log(error);
            }
        });
    });

    router.get('/connect', () => {

    });
}