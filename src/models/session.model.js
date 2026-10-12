// This database is created to maintain the session for every user
import mongoose, { mongo } from "mongoose";

// creating Schema--> structure of the Session Database
const sessionSchema= new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"users",
        required: [true, "User is required"]
    },
    refreshTokenHash:{
        type: String,
        required: [true, "Refresh token hash is required"]
    },
    ip:{
        type: String,
        required: [true, "IP address is required"]
    },
    userAgent:{
        type: String,
        required: [true, "userAgent is required"]
    },
    revoke:{
        type: Boolean,
        default: false,
        required: [true, "revoke is required"]

    },
 
},  { timestamps: true })

// Creating model so that e can perform CURD Operations
const sessionModel=mongoose.model("session", sessionSchema);

export default sessionModel;
