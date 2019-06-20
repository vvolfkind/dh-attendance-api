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

const decode = async (data) => {
    let response = {};
    let decryptData
    try {
        decryptData = await cryptr.decrypt(data);
        response.data = JSON.parse(decryptData);
    } catch (err) {
        log(`Error en datos: ${err}`);
        if (err === null || err === undefined) throw new Error('Error decodificando');
        throw err;
    }

    return response;
};

const encode = async (data) => {
    let encrypt;

    try {
        encrypt = await cryptr.encrypt(JSON.stringify(data));
    } catch(err) {
        log(err);
        throw err;
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
    const response = {};
    let encryptedData;

    if(!isValidJson(req.body.data)) {
        response.message = 'Error al parsear JSON';
        response.code = 400;
        throw new Error(response.message);
    }
    try {
        encryptedData = await cryptr.encrypt(req.body.data);
        response.code = 200;
        response.data = encryptedData;
        respond(res, response);
    } catch(err) {
        if (response.message !== null || response.message !== "undefined") {
            response.code = 400;
            respond(res, response);
        } else {
            response.message = err;
            response.code = 400;
            respond(res, response);
        }
    }
};

const renderQrRequest = async (req, res) => {
    let svg_string = "";
    try {
        svg_string = await QRPrinter.imageSync(req.query.qr, { type: 'png' });
    } catch(err) {
        response.message = err;
        response.code = 500;
        respond(res, response);
    }

    respond(res, { direct: true, data: svg_string });

};

module.exports = { 
    encodeJsonBodyRequest, 
    decryptRequestAndReturnJson,
    encodeStringRequest,
    renderQrRequest 
};