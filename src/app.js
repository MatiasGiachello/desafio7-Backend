import express from 'express'
import session from 'express-session'
import handlebars from 'express-handlebars'
import MongoStore from 'connect-mongo'

import passport from 'passport'
import { initializePassport } from './config/passport.config.js'

import config from './config/config.js'
import { __dirname } from './utils.js'
import './dao/dbConfig.js'

import ProductManager from "./dao/managers/productManagerMongo.js";
const pManager = new ProductManager()

import MessagesManager from './dao/managers/messageManagerMongo.js'
const msgMaganer = new MessagesManager()

import { Server } from 'socket.io'

import productsRouter from './routes/products.js'
import cartRouter from './routes/cart.js'
import viewRouter from './routes/view.js'
import sessionRouter from './routes/sessions.js'

import { checkRole } from './middlewares/auth.js'
import { errorHandler } from './middlewares/error.js'

const app = express()
app.use(express.json())
app.use(errorHandler)
app.use(express.urlencoded({ extended: true }))
const PORT = process.env.PORT || 8080;

app.use(session({
    store: MongoStore.create({
        mongoUrl: config.mongoUrl,
        ttl: 3600
    }),
    secret: 'CoderSecret',
    resave: false,
    saveUninitialized: false
}))
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.static(__dirname + '/public'));

app.use('/api/products', productsRouter)
app.use('/api/carts', cartRouter)
app.use('/api/sessions', sessionRouter)
app.use('/', viewRouter)


const server = app.listen(8080, () => {
    console.log(`Servidor Inicializado en el Puerto ${PORT}`)
})

const socketServer = new Server(server)
socketServer.on('connection', async socket => {
    console.log("Cliente conectado con ID:", socket.id)

    // PRODUCTOS
    const products = await pManager.getProducts();
    socket.emit('productos', products);

    socket.on('addProduct', async (data) => {
        await pManager.addProduct(data);
        const updatedProducts = await pManager.getProducts();
        socketServer.emit('productosupdated', updatedProducts);
    });

    socket.on("deleteProduct", async (id) => {
        await pManager.deleteProduct(id);
        const updatedProducts = await pManager.getProducts();
        socketServer.emit("productosupdated", updatedProducts);
    });

    // CHAT
    socket.on("nuevoUsuario", (usuario) => {
        console.log("Usuario:", usuario)
        socket.broadcast.emit("broadcast", usuario)
    })
    socket.on("disconnect", () => {
        console.log("Usuario desconectado", socket.id)
    })
    socket.on("message", async (info) => {
        await msgMaganer.createMessage(info)
        socketServer.emit("chat", await msgMaganer.getMessages())
    })
})