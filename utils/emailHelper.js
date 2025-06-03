const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD,
    }
});
const verificationEmail = async(to, url, username)=>{
    await transporter.sendMail({
        from: process.env.APP_EMAIL,
        to,
        subject:'E-mail verification',
        html:`<div style="width: 950px; height: 230px; background-color: white; border: 1px solid black; padding: 20px; text-align: left;">
        <h2 style="text-align: center; margin-bottom: 20px;">VERIFY E-MAIL</h2>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">Hi ${username},</p>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">Here's your email verification link. You can click below to verify your email</p>
        <p style="text-align: left; margin-bottom: 0;"><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">If not you kindly ingnore this mail</p>

    </div>`
    })
}

const forgotPasswordEmail = async(to, url, username)=>{
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject:'Reset Password',
        html:`<div style="width: 950px; height: 230px; background-color: white; border: 1px solid black; padding: 20px; text-align: left;">
        <h2 style="text-align: center; margin-bottom: 20px;">RESET PASSWORD</h2>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">Hi ${username},</p>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">Here's your password reset link. You can click below to reset your password</p>
        <p style="text-align: left; margin-bottom: 0;"><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
        <p style="font-size: 16px; color: #333; text-align: left; margin-bottom: 20px;">If not you kindly ingnore this mail</p>

    </div>`
   
    })
    console.log(url)
}


const ticketAssignedEmail = async (to, firstname, ticketId, title, description,ticketUrl) => {
    try {
        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to,
            subject: `New Ticket Assigned: ${title}`,
            html: `<div style="width: 950px; background-color: white; border: 1px solid black; padding: 20px;">
                <h2 style="text-align: center;">NEW TICKET ASSIGNED</h2>
                <p style="font-size: 16px; color: #333;">Hi ${firstname},</p>
                <p style="font-size: 16px; color: #333;">A new ticket has been assigned to you.</p>
                <p style="font-size: 16px; color: #333;"><strong>Ticket ID:</strong> ${ticketId}</p>
                <p style="font-size: 16px; color: #333;"><strong>Title:</strong> ${title}</p>
                <p style="font-size: 16px; color: #333;"><strong>Description:</strong> ${description}</p>
                <p style="text-align: left;">
                    <a href="https://dev-1-frontend.vercel.app/view-ticket/${ticketId}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">View Ticket</a>
                </p>
                <p style="font-size: 16px; color: #333;">Please take necessary actions as soon as possible.</p>
            </div>`
        });
        console.log(`Ticket assignment email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending ticket assignment email: ${error.message}`);
    }
};
const sendSetPasswordEmail = async (to, url, username) => {
    try {
        await transporter.sendMail({
            from: process.env.APP_EMAIL,
            to,
            subject: 'Set Your Password',
            html: `<div style="width: 950px; height: 230px; background-color: white; border: 1px solid black; padding: 20px;">
                <h2 style="text-align: center; margin-bottom: 20px;">SET PASSWORD</h2>
                <p style="font-size: 16px; color: #333;">Hi ${username},</p>
                <p style="font-size: 16px; color: #333;">You’ve been added to the system. Please click the button below to set your login password:</p>
                <p style="text-align: left; margin-bottom: 0;">
                    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Set Password</a>
                </p>
                <p style="font-size: 16px; color: #333; margin-top: 20px;">If you did not request this, you can ignore this email.</p>
            </div>`
        });
        console.log(`Set password email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending set password email: ${error.message}`);
    }
};



module.exports = { 
    verificationEmail,
    forgotPasswordEmail,
    ticketAssignedEmail,
    sendSetPasswordEmail
}