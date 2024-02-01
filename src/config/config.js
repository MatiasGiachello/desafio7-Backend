import dotenv from "dotenv"

dotenv.config()

export default {
    mongoUrl: process.env.MONGO_URL,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    nodeENV: process.env.NODE_ENV,
    gmailNodemailer: process.env.GMAIL_NODEMAILER,
    tokenSecret: process.env.TOKEN_SECRET
}