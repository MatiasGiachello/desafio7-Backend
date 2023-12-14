import mongoose from "mongoose"

const URI = 'mongodb+srv://MatiasGiachello:<Maichelo2004>@cluster0.ehcov7r.mongodb.net/?retryWrites=true&w=majority'

await mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
console.log("Base de datos conectada....")