import { Router } from "express"
import CartManager from "../dao/managers/cartManagerMongo.js"
import ProductManager from "../dao/managers/productManagerMongo.js"
import { __dirname } from "../utils.js"
import { ticketsModel } from "../dao/models/tickets.js"
import { v4 as uuidv4 } from 'uuid';
import { checkRole } from "../middlewares/auth.js"

import CustomError from '../services/errors/CustomError.js'
import EErrors from "../services/errors/enums.js"
import { addCartErrorInfo, addProdInCartErrorInfo } from "../services/errors/info.js"
import { addLogger } from "../utils/logger.js"

const cManager = new CartManager()
const pManager = new ProductManager()

const router = Router()

router.get("/", async (req, res) => {
    const carrito = await cManager.getCarts()
    res.json({ carrito });
})

router.get("/:cid", async (req, res) => {
    const carritoFound = await cManager.getCartById(req.params.cid);
    res.json({ status: "success", carritoFound });
});


router.post('/', checkRole(["user", "premium"]), async (req, res) => {
    try {
        const obj = req.body;
        if (!obj) {
            CustomError.createError({
                name: "Error al Crear el Carrito",
                cause: addCartErrorInfo({ obj }),
                message: "Se ha encontrado un error al crear el Carrito",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }
        if (!Array.isArray(obj)) {
            return res.status(400).send('Invalid request: products must be an array');
        }

        const validProducts = [];

        for (const product of obj) {
            const checkId = await pManager.getProductById(product._id);
            if (checkId.owner == req.session.user.email) {
                return res.send(`No podes agregar tus propios productos al Carrito`);
            }
            if (checkId === `El producto con el ID: ${product._id} no fue encontrado`) {
                return res.status(404).send(`Product with id ${product._id} not found`);
            }
            validProducts.push({ _id: product._id, quantity: product.quantity });
        }
        const cart = await cManager.addCart(validProducts);
        res.status(200).send(cart);

    } catch (err) {
        req.logger.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/:cid/products/:pid", checkRole("user"), async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        if (!cid || !pid || !quantity) {
            CustomError.createError({
                name: "Error al Agregar el Producto en el Carrito",
                cause: addProdInCartErrorInfo({ cid, pid, quantity }),
                message: "Se ha encontrado un agregar el Producto el Carrito",
                code: EErrors.INVALID_TYPES_ERROR
            })
        }
        const checkIdProduct = await pManager.getProductById(pid);
        if (!checkIdProduct) {
            return res.status(404).send({ message: `Product with ID: ${pid} not found` });
        }

        const checkIdCart = await cManager.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ message: `Cart with ID: ${cid} not found` });
        }

        const result = await cManager.addProductInCart(cid, { _id: pid, quantity: quantity });
        req.logger.info(result);
        return res.status(200).send({
            message: `Product with ID: ${pid} added to cart with ID: ${cid}`,
            cart: result,
        });
    } catch (error) {
        req.logger.error(error);
        return res.status(500).send({ message: "An error occurred while processing the request" });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        for (const product of products) {
            const checkId = await pManager.getProductById(product._id);

            if (!checkId) {
                return res.status(404).send({ status: 'error', message: `The ID product: ${product._id} not found` });
            }
        }

        const checkIdCart = await cManager.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ status: 'error', message: `The ID cart: ${cid} not found` });
        }

        const cart = await cManager.updateOneProduct(cid, products);
        return res.status(200).send({ status: 'success', payload: cart });
    } catch (error) {
        req.logger.error(error);
        return res.status(500).send({ status: 'error', message: 'An error occurred while processing the request' });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const checkIdProduct = await pManager.getProductById(pid);
        if (!checkIdProduct) {
            return res.status(404).send({ status: 'error', message: `Product with ID: ${pid} not found` });
        }

        const checkIdCart = await cManager.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ status: 'error', message: `The ID cart: ${cid} not found` });
        }
        await cManager.updateQuantity(cid, pid, quantity);
        return res.status(200).send({ status: 'success', message: `Cantidad del Producto actualizado a ${quantity}` });
    }
    catch (error) {
        req.logger.error(error);
        return res.status(500).send({ status: 'error', message: 'An error occurred while processing the request' });

    }
})

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const checkIdProduct = await pManager.getProductById(pid);
        if (!checkIdProduct) {
            return res.status(404).send({ status: 'error', message: `Product with ID: ${pid} not found` });
        }

        const checkIdCart = await cManager.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ status: 'error', message: `Cart with ID: ${cid} not found` });
        }

        const findProductIndex = checkIdCart.products.findIndex((product) => product._id.toString() === pid);
        if (findProductIndex === -1) {
            return res.status(404).send({ status: 'error', message: `Product with ID: ${pid} not found in cart` });
        }

        checkIdCart.products.splice(findProductIndex, 1);

        const updatedCart = await cManager.deleteProductInCart(cid, checkIdCart.products);

        return res.status(200).send({ status: 'success', message: `Deleted product with ID: ${pid}`, cart: updatedCart });
    } catch (error) {
        req.logger.error(error);
        return res.status(500).send({ status: 'error', message: 'An error occurred while processing the request' });
    }
});


router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cManager.getCartById(cid);

        if (!cart) {
            return res.status(404).send({ message: `Cart with ID: ${cid} not found` });
        }

        if (cart.products.length === 0) {
            return res.status(404).send({ message: 'The cart is already empty' });
        }

        cart.products = [];

        await cManager.updateOneProduct(cid, cart.products);

        return res.status(200).send({
            status: 'success',
            message: `The cart with ID: ${cid} was emptied correctly`,
            cart: cart,
        });
    } catch (error) {
        req.logger.error(error);
        return res.status(500).send({ message: 'An error occurred while processing the request' });
    }
});

router.post('/:cid/purchase', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cManager.getCartById(cartId);

        if (cart) {
            if (!cart.products.length) {
                return res.send("Es necesario que Agregue Productos al Carrito para Realizar la Compra")
            }

            const ticketProducts = []
            const rejectedProducts = []
            let amount = 0

            for (let i = 0; i < cart.products.length; i++) {
                const cartProduct = cart.products[i];
                const productDb = await pManager.getProductById(cartProduct._id._id);
                amount += productDb.price
                let stock = productDb.stock
                stock -= cartProduct.quantity
                if (cartProduct.quantity <= productDb.stock) {
                    ticketProducts.push(cartProduct)
                    pManager.updateProductStock(cartProduct._id._id, stock)
                } else {
                    rejectedProducts.push(cartProduct)
                    return res.send('No hay Suficiente Stock')
                }
            }

            const newTicket = {
                code: uuidv4(),
                purchase_datetime: new Date(),
                amount: amount,
                purchaser: req.user.email
            }

            const ticketCreated = await ticketsModel.create(newTicket)
            res.send(ticketCreated)
        } else {
            res.send("El carrito no existe")
        }

    } catch (error) {
        res.send(error.message)
    }
})

export default router