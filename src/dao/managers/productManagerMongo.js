import { productsModel } from "../models/products.js";
import mongoose from "mongoose";

export default class ProductManager {

    getProducts = async () => {
        try {
            return await productsModel.find().lean();
        } catch (err) {
            return err
        }
    }

    getAllPaginated = async (limit, page, sort, title = "", category = "") => {
        try {
            const search = {
                stock: { $gte: 0 },
                category: { $regex: category, $options: "i" },
                title: { $regex: title, $options: "i" }
            }
            if (sort === "asc") {
                sort = { price: 1 }
            } else if (sort === "desc") {
                sort = { price: -1 }
            }
            const options = {
                page,
                limit,
                sort,
                lean: true
            }
            const allProducts = await productsModel.paginate(search, options)
            return allProducts;
        } catch (error) {
            console.log(error)
        }
    }


    getProductById = async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return `El producto con el ID: ${id} no fue encontrado`;
        }
        try {
            return await productsModel.findById(id);
        } catch (error) {
            return error
        }
    }

    addProduct = async (product) => {
        try {
            const existingProduct = await productsModel.findOne({ code: product.code });

            if (existingProduct) {
                return "Ya existe un producto con el mismo código";
            }

            const newProduct = await productsModel.create(product);
            return newProduct;
        } catch (error) {
            return error;
        }
    }


    updateProduct = async (id, product) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return `El producto con el ID: ${id} no fue encontrado`;
        }
        try {
            return await productsModel.findByIdAndUpdate(id, { $set: product });
        } catch (error) {
            return error
        }
    }

    deleteProduct = async (id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return `El producto con el ID: ${id} no fue encontrado`;
        }

        try {
            const deletedProduct = await productsModel.findByIdAndDelete(id);
            return deletedProduct;
        } catch (error) {
            return error;
        }
    }
}