import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePict: { type: String, default: '/images/profilePic.png' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export { User }