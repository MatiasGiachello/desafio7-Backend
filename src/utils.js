import { dirname } from "path"
import { fileURLToPath } from "url"
import bcrypt from "bcrypt"
import { faker } from "@faker-js/faker"

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const __dirname = dirname(fileURLToPath(import.meta.url))

export const generateProducts = (id) => {
    return {
        id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: faker.string.numeric(1),
        code: faker.string.alphanumeric(10),
        category: faker.commerce.product(),
        img: faker.image.url(),
        status: true
    }
}