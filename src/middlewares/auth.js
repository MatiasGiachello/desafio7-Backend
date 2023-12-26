export const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.json({ status: "error", message: "Necesitas estar Autenticado" });
        }
        if (!roles.includes(req.session.user.role)) {
            return res.send({ status: "error", message: "No estas Autorizado" });
        }
        next();
    }
}

export const publicAccess = (req, res, next) => {
    next();
}

export const sessionAccess = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login');
    }
}