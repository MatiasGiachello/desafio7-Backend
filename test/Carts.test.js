import chai from "chai";
import supertest from "supertest";

const expect = chai.expect
const requester = supertest("http://localhost:8080")

describe("Testing Carts", () => {

    describe("Test Carts", () => {
        it("El endpoint GET /api/carts debe devolver un array con los carritos", async () => {
            const {
                statusCode,
                ok,
                _body
            } = await requester.get(`/api/carts`)
            console.log(statusCode)
            console.log(ok)
            console.log(_body)
            expect(_body.carrito).to.be.ok
        })

        it("El endpoint GET /api/carts/:cid debe devolver un carrito específico", async () => {
            const productId = "653e898c2995d7d801dd35ea";
            const {
                statusCode,
                ok,
                _body
            } = await requester.get(`/api/carts/${productId}`);

            console.log(statusCode);
            console.log(ok);
            console.log(_body);
        });

        it("El endpoint POST /api/carts debe agregar un carrito correctamente", async () => {
            const cartToAdd = [
                {
                    _id: "64f24671b788d50b3321469b",
                    quantity: 100
                }
            ];

            const {
                statusCode,
                _body
            } = await requester.post('/api/carts')
                .send(cartToAdd)
                .set('Content-Type', 'application/json');

            console.log(statusCode);
            console.log(_body);
        });

        it("El endpoint DELETE /api/carts/:cid debe vaciar un carrito correctamente", async () => {
            const productId = "655d4493f9a38017417cbdfe";
            const {
                statusCode,
                ok,
                _body
            } = await requester.get(`/api/carts/${productId}`);

            console.log(statusCode);
            console.log(ok);
            console.log(_body);
        });
    })
})