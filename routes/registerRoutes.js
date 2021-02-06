import express from 'express';

const app = express();
const routerRegister = express.Router();

routerRegister.get('/', (req, res, next) => {

    let payload = {
        pageTitle: "Register"
    }

    res.status(200).render('register', payload);

});

routerRegister.post('/', (req, res, next) => {

    let payload = {
        pageTitle: "Register"
    }

    res.status(200).render('register', payload);

});

export { routerRegister };