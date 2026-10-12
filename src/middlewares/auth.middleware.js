// All the middleware related to Authentication
import userModel from '../models/user.model.js'

const isUserRegistered=async(req, res, next)=>{

    // take the suer's Credentials from req body 
    const{username, email}=req.body;

    // check if the user exists in the database with same Credentials(use unique here email)
    const isUserExists=await userModel.findOne({

        $or: [
            {Username: username},
            {Email: email}
        ]
    })

    if(isUserExists)
    {
        return res.status(409).json({

            message: "User already registered with this Credentials"
        })
    }

    next();
}

export default {isUserRegistered};