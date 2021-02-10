import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../schemas/UserSchema';

const app = express();
const routerRegister = express.Router();

routerRegister.get('/', (req, res, next) => {

    let payload = {
        pageTitle: "Register"
    }

    res.status(200).render('register', payload);

});

routerRegister.post('/', async (req, res, next) => {

    let firstname = req.body.firstName.trim();
    let lastname = req.body.lastName.trim();
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password;
    let payload = req.body;

    payload.pageTitle = "Register";

    if (firstname && lastname && username && email && password) {

        const user = await User.findOne({
            $or: [
                {username: username},
                {email: email},
            ]
        })
        .catch((error) => {
            console.log(error);
            payload.errorMessage = "Something went wrong.";
            res.status(200).render('register', payload);
        });

        if (user == null) {
            // User not found
            let data = req.body;
            data.password = await bcrypt.hash(password, 10);
            User.create(data)
            .then((user) => {
                req.session.user = user;
                return  res.redirect('/');
            })
            .catch((error) => {
                console.log(error);
            })
        } else {
            // User found
            if (email == user.email) {
                payload.errorMessage = "Email already in use.";
            } else {
                payload.errorMessage = "Username already in use.";
            }
            res.status(200).render('register', payload);
        }

    } else {

        payload.errorMessage = "Make shure each field has a valid value";
        res.status(200).render('register', payload);

    }

});

export { routerRegister };