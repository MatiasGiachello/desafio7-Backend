import mongoose from "mongoose";
import chai from "chai";
import config from "../src/config/config.js";
import ProductManager from "../src/dao/managers/productManagerMongo.js"

const pManager = new ProductManager()
const URI = config.mongoUrl;
const expect = chai.expect

describe("Testing Products", () => {
    let createdProduct

    before(async function () {
        this.timeout(10000);
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
    });

    it("El Dao debe obtener los Productos en formato de Array", async function () {
        const result = await pManager.getProducts();
        expect(Array.isArray(result)).to.be.equals(true);
    });

    it("El Dao debe crear un Producto", async function () {
        const productTest = {
            title: "Producto Prueba",
            description: "Este es un producto prueba",
            price: 500,
            status: true,
            category: "Cinturones",
            code: "BBB000",
            stock: 12
        };

        const created = await pManager.addProduct(productTest);
        createdProduct = created;
        expect(created).to.have.property('_id')
    });

    it("El Dao debe obtener el producto por ID", async function () {
        if (createdProduct) {
            const result = await pManager.getProductById({ _id: createdProduct._id });
            expect(result).to.deep.include({ _id: createdProduct._id });
        } else {
            expect.fail("No se creó ningún producto para buscar");
        }
    });

    it("El Dao debe eliminar el producto", async function () {
        if (createdProduct) {
            const deleted = await pManager.deleteProduct(createdProduct._id);
            expect(deleted).to.be.ok
        } else {
            expect.fail("No se creó ningún producto para eliminar");
        }
    });

    after(async function () {
        await mongoose.disconnect();
    });
});