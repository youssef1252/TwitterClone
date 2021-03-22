import express from 'express';
import { User } from '../../schemas/UserSchema';
import { Post } from '../../schemas/PostSchema';

const postsApiRoute = express.Router();

postsApiRoute.get('/', async (req, res, next) => {

    const results = await getPosts({});
    res.status(200).send(results);

});

postsApiRoute.get('/:id', async (req, res, next) => {

    const postId = req.params.id;
    let postData = await getPosts({ _id: postId} );
    let results = {};
    
    postData = postData[0];
    results.postData = postData;
    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo;
    }
    results.replies = await getPosts({ replyTo: postId });
    res.status(200).send(results);

});

postsApiRoute.post('/', async (req, res, next) => {

    if (!req.body.content) {
        return res.sendStatus(400);
    }

    let postData = {
        content: req.body.content,
        postedBy: req.session.user
    };

    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo;
    }
    Post.create(postData)
    .then(async newPost => {
        newPost = await User.populate(newPost, { path: 'postedBy' });
        res.status(201).send(newPost);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

});

postsApiRoute.put('/:id/like', async (req, res, next) => {

    const postId = req.params.id;
    const userId = req.session.user._id;
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId);
    const option = isLiked ? "$pull" : "$addToSet";

    // Insert user like
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
    // Insert post like
    let post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).send(post);

});

postsApiRoute.post('/:id/retweet', async (req, res, next) => {

    const postId = req.params.id;
    const userId = req.session.user._id;
    const deletedPost = await Post.findOneAndDelete({ postedBy: userId, retweetData: postId })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
    const option = deletedPost != null ? "$pull" : "$addToSet";
    let repost = deletedPost;

    if (repost == null) {

        repost = await Post.create({ postedBy: userId, retweetData: postId })
        .catch(error => {
            console.log(error);
            res.sendStatus(400);
        });

    }
    // Insert user retweets
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { retweets: repost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });
    // Insert post retweets
    let post = await Post.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    res.status(200).send(post);

});

postsApiRoute.delete('/:id', async (req, res, next) => {
    await Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
});

async function getPosts(filter) {

    let results = await Post.find(filter)
    .populate('postedBy')
    .populate('retweetData')
    .populate('replyTo')
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error));

    results = await User.populate(results, { path: "replyTo.postedBy" });
    return await User.populate(results, { path: "retweetData.postedBy" });

}

export { postsApiRoute }