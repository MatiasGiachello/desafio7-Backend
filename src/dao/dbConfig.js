import mongoose from "mongoose"
import config from "../config/config.js"

const URI = config.mongoUrl

await mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
console.log("Base de datos conectada....")