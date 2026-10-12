// creating Schema for OTP
// OTP is stored in hash format into the Database
import mongoose from "mongoose";

const otpSchema=new mongoose.Schema({

    Email:{
        type: String,
        required: [true, "Email is required"] 
    },
    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User is required"]
    },
    OTPHash:{
        type: String,
        required: [true, "OTP hash is required"]
    }
},
    {
        timestamps: true
    }
)

const otpModel=mongoose.model("otps", otpSchema);

export default otpModel