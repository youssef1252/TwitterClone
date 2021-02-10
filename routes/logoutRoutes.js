import express from 'express';

const routerLogout = express.Router();

routerLogout.get('/', (req, res, next) => {

    if (req.session) {
        req.session.destroy(() => {
            return  res.redirect('/login');
        });
    }

});

export { routerLogout };