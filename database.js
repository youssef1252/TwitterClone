import mongoose from 'mongoose';
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

class Database {

    constructor(localy=false) {

        this.url = localy ? 'mongodb://localhost:27017/twitterCloneDB' : "mongodb+srv://admin:admin@twitterclone.lzv6p.mongodb.net/twitterCloneDB?retryWrites=true&w=majority";
        this.connect(this.url);
        
    }

    connect(url) {

        mongoose.connect(url)
        .then(() => {
            console.log("database connection successful");
        })
        .catch((err) => {
            console.log(`database connection error ${err}`);
        });

    }
}
export default new Database();