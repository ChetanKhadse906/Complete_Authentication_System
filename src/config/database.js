import mongoose from 'mongoose'
import config from './config.js'

const ConnectDB=async()=>{

    try{

        await mongoose.connect(config.MONGO_URI)

        console.log("Connected to MongoDB Database Successfully")
    }
    catch(err)
    {
        console.log("Unable to connect to DB, Error: ", err);
    }
}

export default ConnectDB;