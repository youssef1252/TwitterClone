import express from 'express';
import { Post } from '../schemas/PostSchema';

const routerPost = express.Router();

routerPost.get('/:id', (req, res, next) => {

    let userLogged = req.session.user;
    let payload = {
        pageTitle: "View post",
        userLoggedIn: userLogged,
        userLoggedInJs: JSON.stringify(userLogged),
        postId: req.params.id
    }
    
    res.status(200).render('posts/view', payload);

});

export { routerPost };