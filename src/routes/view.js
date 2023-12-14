import { Router } from "express";
import ProductManager from "../dao/managers/productManagerMongo.js";
import CartManager from "../dao/managers/cartManagerMongo.js";

const router = Router()
const pManager = new ProductManager()
const cManager = new CartManager()

const publicAccess = (req, res, next) => {
    next();
}
const privateAccess = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login')
    next()
}
const adminAccess = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/profile');
    }
}

router.get('/', publicAccess, (req, res) => {
    res.render("home", { title: "Lans - Home", isHomePage: true })
})

router.get('/products', privateAccess, async (req, res) => {
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
        console.log(error)
    }
})

router.get('/carts/:cid', privateAccess, async (req, res) => {
    const cart = await cManager.getCartById(req.params.cid)
    res.render("cart", { cart, title: "Lans - Carrito" })
})

router.get('/realtimeproducts', adminAccess, (req, res) => {
    res.render("realTimeProducts", { title: "Lans - Admin Productos" })
})

router.get('/chat', (req, res) => {
    res.render("chat", { title: "Lans - Chat" })
})

//SESSION
router.get('/login', publicAccess, (req, res) => {
    res.render('login', { title: 'Lans - Login' })
})

router.get('/register', publicAccess, (req, res) => {
    res.render('register', { required: 'required', title: 'Lans - Registro' })
})

router.get('/profile', privateAccess, (req, res) => {
    res.render('profile', {
        user: req.session.user,
        title: 'Lans - Perfil'
    })
})
export default router