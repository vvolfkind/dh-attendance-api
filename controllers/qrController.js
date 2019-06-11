const QRPrinter = require('qr-image');
const Cryptr = require('cryptr');
const { respond, log } = require('../helpers')

const cryptr = new Cryptr(process.env.CRYPTR);

const isValidJson = (str) => {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

const decode = (data) => {
    const response = {};

    try {
        response.data = JSON.parse(cryptr.decrypt(data));
    } catch (err) {
        log(`Error en datos: ${err}`);
        response = false;
    }

    return response;
};

const encode = async (data) => {
    let encrypt;

    try {
        encrypt = await cryptr.encrypt(JSON.stringify(data));
    } catch(err) {
        log(err);
        console.error(err);
        respond(res, {
            "code": 400,
            "message": err
        });
    }

    return encrypt;
};

const encodeJsonBodyRequest = async (req, res) => {
    let response = {};

    try {
        response.data = await encode(req.body);
        respond(res, response);
    } catch(err) {
        log(err);
        console.error(err);
        respond(res, {
            "code": 400,
            "message": err
        });
    }

};

const decryptRequestAndReturnJson = async (req, res) => {
    try {
        respond(res, await decode(req.body.data));
    } catch(err) {
        log(err);
        console.error(err);
        respond(res, {
            "code": 400,
            "message": err
        });
    }
};

const encodeStringRequest = async (req, res) => {
    if(!isValidJson(req.body.data)) {
        respond(res, {
            "code": 400,
            "message": "Error al parsear JSON"
        });
    }
    try {

    } catch(err) {
        log(err);
        console.error(err);
        respond(res, {
            "code": 400,
            "message": err
        });
    }
};

const renderQrRequest = async (req, res) => {
    let svg_string = "";
    try {
        svg_string = await QRPrinter.imageSync(req.query.qr, { type: 'png' });
    } catch(err) {
        log(err);
        respond(res, err);
    }

    respond(res, { direct: true, data: svg_string });

};

module.exports = { 
    encodeJsonBodyRequest, 
    decryptRequestAndReturnJson,
    encodeStringRequest,
    renderQrRequest 
};