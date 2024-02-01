import { Router } from "express";
import { userModel } from "../dao/models/user.js";
import passport from "passport";
import { addLogger } from "../utils/logger.js"
import { sendRecoveryPass } from "../utils/email.js";
import { generateEmailToken, verifyEmailToken, createHash, isValidPassword } from "../utils.js";

const router = Router();

router.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), async (req, res) => {

    if (!req.user) return res.status(401).send({
        status: "error", error: "Email incorrecto"
    })

    if ((req.user.email === "adminCoder@coder.com")) {
        req.session.user = {
            name: `${req.user.first_name} ${req.user.last_name}`,
            email: req.user.email,
            age: req.user.age,
            role: "admin"
        }
        return res.send({ status: 'sucess', payload: req.session.user })
    }

    req.session.user = {
        name: `${req.user.first_name} ${req.user.last_name}`,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role
    }
    res.send({ status: "success", payload: req.user })
})
router.get('/faillogin', (req, res) => {
    res.send({ status: "error", message: "Error al iniciar sesión" })
})

router.post('/register', passport.authenticate('register', { failureRedirect: '/failregister' }), async (req, res) => {
    res.send({ status: "success", message: "Usuario Registrado" })
})
router.get('/failregister', (req, res) => {
    req.logger.warn("Error al Registrarse")
    res.send({ status: "error", message: "Error al registrar" })
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = {
        name: req.user.first_name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role
    }
    res.redirect('/products')
})

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/googlecallback', passport.authenticate('google', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = {
        name: req.user.first_name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role
    }
    res.redirect('/products');
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            req.logger.warn(`Error al cerrar sesión ${err}`)
            res.status(500).send({ status: "error", error: "Error al cerrar sesión" });
        } else {
            res.redirect('/login');
        }
    });
});

router.get('/current', (req, res) => {
    if (req.session.user) {
        res.send({ status: "success", payload: req.session.user })
    } else {
        res.send({ status: "error", error: "No hay usuario logueado" })
    }
})


// PROBANDO RECUPERAR CONTRASEÑA

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        //verificamos que el usuario exista
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.send(`<div>Error, <a href="/forgot-password">Intente de nuevo</a></div>`);
        }
        //si el usuario existe, generamos el token del enlace
        const token = generateEmailToken(email, 60 * 60);
        await sendRecoveryPass(email, token);
        res.send("se envio un correo a su cuenta para restablecer la contraseña, regresar <a href='/login'>al login</a>");
    } catch (error) {
        console.log(error)
        res.send(`<div>Error, <a href="/forgot-password">Intente de nuevo</a></div>`)
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const token = req.query.token;
        const { email, newPassword } = req.body;
        //validamos el token
        const validEmail = verifyEmailToken(token);
        if (!validEmail) {
            return res.send(`El enlace ya no es valido, genere un nuevo enlace para recuperar la contraseña <a href="/forgot-password" >Recuperar contraseña</a>`)
        }
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.send("El usuario no esta registrado")
        }
        if (isValidPassword(user, newPassword)) {
            return res.send("No puedes usar la misma contraseña");
        }
        const userData = {
            ...user._doc,
            password: createHash(newPassword)
        }
        const userUpdate = await userModel.findOneAndUpdate({ email: email }, userData);
        res.redirect('/login');
    } catch (error) {
        res.send(error.message);
    }
});

export default router