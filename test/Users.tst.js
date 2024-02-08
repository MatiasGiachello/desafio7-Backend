import mongoose from "mongoose";
import config from "../src/config/config.js";
import Assert from "assert";
import { userModel } from "../src/dao/models/user.js";

const assert = Assert.strict;
const URI = config.mongoUrl;

describe("Testing Usuarios", () => {
    let createdUser;

    before(async function () {
        this.timeout(10000);
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
    });

    it("El Dao debe obtener los usuarios en formato de Array", async function () {
        const result = await userModel.find();
        assert.strictEqual(Array.isArray(result), true);
    });

    it("El Dao debe crear un usuario", async function () {
        const userTest = {
            first_name: "User",
            email: "user@example.com",
        };

        const created = await userModel.create(userTest);
        createdUser = created;
        assert.strictEqual(created.first_name, userTest.first_name);
    });

    it("El Dao debe obtener el usuario por email", async function () {
        const foundUser = await userModel.findOne({ email: "user@example.com" });
        assert.strictEqual(foundUser.email, "user@example.com");
    });

    it("El Dao debe eliminar el usuario", async function () {
        if (createdUser) {
            const deleted = await userModel.findByIdAndDelete(createdUser._id);
            assert.strictEqual(deleted._id.toString(), createdUser._id.toString());
        } else {
            assert.fail("No se creó ningún usuario para eliminar");
        }
    });

    after(async function () {
        await mongoose.disconnect();
    });
});


