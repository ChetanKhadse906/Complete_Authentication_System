import mongoose from 'mongoose'

const userSchema=new mongoose.Schema({

    Username:{
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username must be unique"]
    },

    Email:{
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is required"]
    },

    Password:{
        type: String,
        required: [true, "Password is required"]
    },
    Verified:{
        type: Boolean,
        default: false
    }
})

// create model
const userModel= mongoose.model("user", userSchema);

export default userModel;