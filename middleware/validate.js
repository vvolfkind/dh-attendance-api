const { check, validationResult } = require('express-validator/check');

const { respond, log } = require('../helpers')

module.exports = (req, res, next) => {
    const response = {};

    check('email', 'Invalid Email').isEmail(),
    check('password', 'Password is reqired').exists();

    if (!validationResult(req).isEmpty()) {
        response.code = 400;
        response.error = "Error en datos";
        respond(res, response);
    } else {
        next();
    }

}