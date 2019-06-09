const request = require('request');

const verify = (email) => {
    return new Promise((resolve, reject) => {
        let url = process.env.SGE_API + email;
        // request.get(url, (err, res) => {
        //     if (err) {
        //         colsole.log(err);
        //         log(err);
        //         reject(err);
        //     }
        // });
    });
}