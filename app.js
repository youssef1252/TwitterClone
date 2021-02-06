import express from 'express';
import { requireLogin } from './middleware';
import { routerLogin } from './routes/loginRoutes';
import { routerRegister } from './routes/registerRoutes';
import path from 'path';

const app = express();
const port = "3001";

app.set("view engine", "pug");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/login", routerLogin);
app.use("/register", routerRegister);

app.get('/', requireLogin, (req, res, next) => {

    let payload = {
        pageTitle: "Home"
    }

    res.status(200).render('home', payload);
});

app.listen(port, () => console.log(`Server listen on port ${port}`));