module.exports = (express) => {
  const router = express.Router();

  const qrController = require('../../controllers/qrController');
  const auth = require('../../middleware/auth');

  /**
   * @route   GET api/encodeJson
   * @desc    Encodes json body
   * @access  Private
   */
  router.get('/encodeJson', qrController.encodeJsonBodyRequest);

  /**
   * @route   GET api/encodeString
   * @desc    Encodes string
   * @access  Private
   */
  router.get('/encodeString', qrController.encodeStringRequest);

  /**
   * FOR TESTING/DEVELOPEMENT ONLY
   * @route   GET api/decrypt
   * @desc    Decrypts an encrypted string and returns a json response
   * @access  Private
   */
  router.get('/decrypt', qrController.decryptRequestAndReturnJson);

  /**
   * @route   GET api/renderQR
   * @desc    Renders a QR code on screen
   * @access  Private
   */
  router.get('/render', qrController.renderQrRequest);

  return router;

}