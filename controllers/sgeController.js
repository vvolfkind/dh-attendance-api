const request = require('request');
const { log } = require('../helpers')

let TOKEN = null;

const refreshToken = (time) => {
    const next_run = time/60/60/24;
    console.log('Valid for: ', next_run, ' days.')
    // setTimeout(() => {
    //     getToken();
    // }, next_run)
}

const validateMail = (email) => {
    return new Promise((resolve, reject) => {
        console.log(process.env.SGE_API + email);
        request.get({
            url: process.env.SGE_API + email,
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body).data);
            } else {
                reject('Invalid email')
            }
        })
    })
}

const getToken = () => {
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            TOKEN = data.data.accessToken;
            refreshToken(data.data.expiresIn);
        } else {
            log('Error: ', error);
        }
    }
    
    return request.post('http://dhim.digbang.com/api/auth/authorization', 
    {
        form: {
            grantType: 'client_credentials',
            clientId: process.env.SGE_CLIENT,
            clientSecret: process.env.SGE_SECRET
            
        }
    }, callback)
}

getToken();

// validateMail('agus_maraz@hotmail.com').then(e => console.log(e));



module.exports = validateMail;