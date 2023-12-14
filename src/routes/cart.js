import { Router } from "express"
import CartManager from "../dao/managers/cartManagerMongo.js"
import ProductManager from "../dao/managers/productManagerMongo.js"
import { __dirname } from "../utils.js"

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


router.post('/', async (req, res) => {
    try {
        const obj = req.body;
        if (!Array.isArray(obj)) {
            return res.status(400).send('Invalid request: products must be an array');
        }

        const validProducts = [];

        for (const product of obj) {
            const checkId = await pManager.getProductById(product._id);
            if (checkId === `El producto con el ID: ${product._id} no fue encontrado`) {
                return res.status(404).send(`Product with id ${product._id} not found`);
            }
            validProducts.push({ _id: product._id, quantity: product.quantity });
        }
        const cart = await cManager.addCart(validProducts);
        res.status(200).send(cart);

    } catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post("/:cid/products/:pid", async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const checkIdProduct = await pManager.getProductById(pid);
        if (!checkIdProduct) {
            return res.status(404).send({ message: `Product with ID: ${pid} not found` });
        }

        const checkIdCart = await cManager.getCartById(cid);
        if (!checkIdCart) {
            return res.status(404).send({ message: `Cart with ID: ${cid} not found` });
        }

        const result = await cManager.addProductInCart(cid, { _id: pid, quantity: quantity });
        console.log(result);
        return res.status(200).send({
            message: `Product with ID: ${pid} added to cart with ID: ${cid}`,
            cart: result,
        });
    } catch (error) {
        console.error("Error occurred:", error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
        return res.status(500).send({ message: 'An error occurred while processing the request' });
    }
});

export default router