import passport from "passport";
import local from "passport-local";
import { userModel } from '../dao/models/user.js'
import { createHash, isValidPassword } from "../utils.js";
import gitHubStrategy from "passport-github2";
import mongoose from "mongoose";
import config from "./config.js";
import GoogleStrategy from "passport-google-oauth20";

const LocalStrategy = local.Strategy;
const GitHubStrategy = gitHubStrategy.Strategy;

export const initializePassport = () => {
    passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' }, async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
            const exists = await userModel.findOne({ email });
            if (exists) {
                console.log('El usuario ya existe')
                return done(null, false);
            };
            const newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                cart: new mongoose.Types.ObjectId()
            };
            let result = await userModel.create(newUser);
            return done(null, result)
        } catch (error) {
            return done('Error al crear el usuario:' + error)
        }
    }));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
        try {
            const user = await userModel.findOne({ email: username });
            if (!user) {
                console.log("No existe el usuario")
                return done(null, false);
            }
            if (!isValidPassword(user, password)) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error)
        }
    }));

    passport.use('github', new GitHubStrategy({
        clientID: config.githubClientId,
        clientSecret: config.githubClientSecret,
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.login,
                    email: profile._json.email,
                    avatar: profile._json.avatar_url,
                    role: "user",
                    cart: new mongoose.Types.ObjectId()
                }
                let result = await userModel.create(newUser)
                return done(null, result)
            }
            done(null, user)
        } catch (error) {
            return done(error)
        }
    }))

    passport.use('google', new GoogleStrategy({
        clientID: config.googleClientId,
        clientSecret: config.googleClientSecret,
        callbackURL: 'http://localhost:8080/api/sessions/googlecallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile.emails[0].value });
            if (!user) {
                let newUser = {
                    first_name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    role: "user",
                    cart: new mongoose.Types.ObjectId()
                }
                let result = await userModel.create(newUser);
                return done(null, result);
            }
            done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    })
}