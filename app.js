import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import { requireLogin } from './middleware';
import { routerLogin } from './routes/loginRoutes';
import { routerRegister } from './routes/registerRoutes';
import { routerLogout } from './routes/logoutRoutes';
import { postsApiRoute } from './routes/api/posts';
import { routerPost } from './routes/postRoutes';
import { profileLogin } from './routes/profileRoutes';
import Database from './database';

const app = express();
const port = "3001";
const dataBase = Database;

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: 'Secret API',
    resave: true,
    saveUninitialized: false
}));

// Routes
app.use("/login", routerLogin);
app.use("/logout", routerLogout);
app.use("/register", routerRegister);
app.use("/posts", requireLogin, routerPost);
app.use("/profile", requireLogin, profileLogin);

app.use("/api/posts", requireLogin, postsApiRoute);

app.get('/', requireLogin, (req, res, next) => {

    let userLogged = req.session.user;
    let payload = {
        pageTitle: "Home",
        userLoggedIn: userLogged,
        userLoggedInJs: JSON.stringify(userLogged)
    }

    res.status(200).render('posts/index', payload);
});

app.listen(port, () => console.log(`Server listen on port ${port}`));