import { Router } from "express";
import { userModel } from "../dao/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
import passport from "passport";
import { addLogger } from "../utils/logger.js"


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


export default router