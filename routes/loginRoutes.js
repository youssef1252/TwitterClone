import express from 'express';

const app = express();
const routerLogin = express.Router();

routerLogin.get('/', (req, res, next) => {

    let payload = {
        pageTitle: "Login"
    }

    res.status(200).render('login', payload);

});

export { routerLogin };