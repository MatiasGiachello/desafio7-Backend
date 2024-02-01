import config from "../config/config.js";
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fertorron21@gmail.com',
        pass: config.gmailNodemailer,
    },
});

export const sendRecoveryPass = async (userEmail, token) => {
    const link = `http://localhost:8080/reset-password?token=${token}`;//enlace con el token

    //estructura del correo
    await transporter.sendMail({
        from: "fertorron21@gmail.com",
        to: userEmail,
        subject: "Lans - Restablecer contraseña",
        html: `
            <div>
                <h2>Has solicitado un cambio de contraseña</h2>
                <p>Da clic en el siguiente enlace para restablecer la contraseña</p>
                <a href="${link}">
                    <button> Restablecer contraseña </button>
                </a>
            </div>
        `
    })
};