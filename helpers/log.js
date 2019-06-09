const moment = require('moment-timezone');

/*
Log outputs to console with the "[YYYY-MM-DD HH:mm:ss] message" format.
*/
const log = (...messages) => {
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        console.log(`[${moment().tz("America/Buenos_Aires").format("YYYY-MM-DD HH:mm:ss")}] ${message}`);        
    }
}

module.exports = log;