import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../schemas/UserSchema';

const routerLogin = express.Router();

routerLogin.get('/', (req, res, next) => {

    let payload = {
        pageTitle: "Login"
    }
    res.status(200).render('security/login', payload);

});

routerLogin.post('/', async (req, res, next) => {

    let payload = req.body;
    payload.pageTitle = "Login";
    if (req.body.logUsername && req.body.logPassword) {
        const user = await User.findOne({
            $or: [
                {username: req.body.logUsername},
                {email: req.body.logUsername},
            ]
        })
        .catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render('login', payload);
        });

        if (user) {

            let result = await bcrypt.compare(req.body.logPassword, user.password);
            if (result) {
                req.session.user = user;
                return  res.redirect('/');
            }

        }
        payload.errorMessage = "Login credential incorrect.";
        return res.status(200).render('login', payload);

    }

    payload.errorMessage = "Make shure each field has valid value.";
    return res.status(200).render('login', payload);

});

export { routerLogin };