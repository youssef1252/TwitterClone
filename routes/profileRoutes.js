import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../schemas/UserSchema';

const profileLogin = express.Router();

profileLogin.get('/', async (req, res, next) => {

    let payload = await getPayload(req)
    res.status(200).render('security/profile', payload);

});

profileLogin.get('/:username', async (req, res, next) => {

    let payload = await getPayload(req)
    res.status(200).render('security/profile', payload);

});

async function getPayload(req) {
    
    let userLogged = req.session.user;
    let pageInformation = {
        pageTitle: userLogged.username,
        userLoggedIn: userLogged,
        userLoggedInJs: JSON.stringify(userLogged),
        profileUser: JSON.stringify(userLogged),
    };
    if (req.params && req.params.username) {
        try {
            let user = await User.findOne({ username: req.params.username });
            user = !user ? await User.findById(req.params.username) : user;
            pageInformation = !user ? 
            { pageTitle: req.params.username }
                : 
            {
                pageTitle: user.username,
                userLoggedIn: user,
                userLoggedInJs: JSON.stringify(user),
                profileUser: user,
            }   
        } catch (error) {
            pageInformation = { pageTitle: req.params.username }
        }
    }
    return pageInformation;

}

export { profileLogin };