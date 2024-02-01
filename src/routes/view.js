import { Router } from "express";
import ProductManager from "../dao/managers/productManagerMongo.js";
import CartManager from "../dao/managers/cartManagerMongo.js";

const router = Router()
const pManager = new ProductManager()
const cManager = new CartManager()
import { checkRole, sessionAccess, publicAccess } from "../middlewares/auth.js";
import { generateProducts } from "../utils.js";
import { addLogger } from "../utils/logger.js"


router.get('/', publicAccess, (req, res) => {
    res.render("home", { title: "Lans - Home", isHomePage: true })
})

router.get('/products', sessionAccess, async (req, res) => {
    const {
        limit = 10,
        page = 1,
        sort = "asc",
        title = "",
        category = ""
    } = req.query

    const products = await pManager.getAllPaginated(limit, page, sort, title, category)
    try {
        products.docs = await products.docs.map(product => {
            const {
                _id,
                title,
                description,
                price,
                code,
                stock,
                category,
                thumbnail
            } = product
            return {
                id: _id,
                title,
                description,
                price,
                code,
                stock,
                category,
                thumbnail
            }
        })

        const info = {
            totalPages: products.totalPages,
            prevPage: products.prevPage,
            nextPage: products.nextPage,
            page: products.page,
            hasPrevPage: products.hasPrevPage,
            hasNextPage: products.hasNextPage,
            prevLink: products.hasPrevPage
                ? `/products?page=${products.prevPage}`
                : null,
            nextLink: products.hasNextPage
                ? `/products?page=${products.nextPage}`
                : null
        }

        const listProducts = products.docs
        const { hasPrevPage, hasNextPage, page, prevLink, nextLink } = info
        res.render("products", { listProducts, hasPrevPage, hasNextPage, page, prevLink, nextLink, user: req.session.user, title: "Lans - Productos" })
    } catch (error) {
        req.logger.error(error)
    }
})

router.get('/carts/:cid', checkRole("user"), async (req, res) => {
    const cart = await cManager.getCartById(req.params.cid)
    res.render("cart", { cart, title: "Lans - Carrito" })
})

router.get('/realtimeproducts', checkRole("admin"), (req, res) => {
    res.render("realTimeProducts", { title: "Lans - Admin Productos" })
})

router.get('/chat', checkRole("user"), (req, res) => {
    res.render("chat", { title: "Lans - Chat", user: req.session.user.name })
})

//SESSION
router.get('/login', publicAccess, (req, res) => {
    res.render('login', { title: 'Lans - Login' })
})

router.get('/register', publicAccess, (req, res) => {
    res.render('register', { required: 'required', title: 'Lans - Registro' })
})

router.get('/profile', sessionAccess, (req, res) => {
    res.render('profile', {
        user: req.session.user,
        title: 'Lans - Perfil'
    })
})

router.get('/mockingproducts', (req, res) => {
    let products = []
    let id = 0
    for (let i = 0; i < 100; i++) {
        id++
        products.push(generateProducts(id))
    }
    res.send(products)
})


router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', {
        title: 'Lans - Restablecer Contraseña'
    })
})
router.get('/reset-password', (req, res) => {
    const token = req.query.token
    res.render('resetPassword', {
        title: 'Lans - Restablecer Contraseña',
        token: token
    })
})

router.get('/sucess-email', (req, res) => {
    res.render('mailPassword', {
        title: 'Lans - Restablecer Contraseña'
    })
})
router.get('/error-email', (req, res) => {
    res.render('mailErrorPassword', {
        title: 'Lans - Restablecer Contraseña'
    })
})


export default router