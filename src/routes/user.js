import { Router } from "express";
import { checkRole } from "../middlewares/auth.js";
import { userModel } from "../dao/models/user.js";

const router = Router();

router.put("/premium/:uid", checkRole(["admin"]), async (req, res) => {
    try {
        const userId = req.params.uid
        const user = await userModel.findById(userId)
        const userRol = user.role
        if (userRol === "user") {
            user.role = "premium"
        } else if (userRol === "premium") {
            user.role = "user"
        } else {
            return res.json({ status: "error", message: "no es posible cambiar el role del usuario" });
        }
        await userModel.updateOne({ _id: user._id }, user)
        res.send({ status: "success", message: "Rol Modificado" });
    } catch (error) {
        console.log(error.message)
        res.json({ error: error, message: "Hubo un error al cambiar el Rol del Usuario" })
    }
});

export default router;