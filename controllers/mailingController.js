const nodemailer = require("nodemailer");

const mailer = async (token, email) => {
    let testAccount = await nodemailer.createTestAccount();
    let url = 'https://attendance.digitalhouse.com/validate/' + token;
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ignacio2@ethereal.email',
            pass: '8AZFYswGFTJanZj7Ha'
        }
    });

    let info = await transporter.sendMail({
        from: 'no-reply@digitalhouse.com', // sender address
        to: email, // list of receivers
        subject: "Benvenido!", // Subject line
        text: "Hello world?", // plain text body
        html: "<a>" + url + "</a>" // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    

}

module.exports = {
    mailer
}