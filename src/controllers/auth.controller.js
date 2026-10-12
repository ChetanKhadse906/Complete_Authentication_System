import userModel from '../models/user.model.js'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import sessionModel from '../models/session.model.js'
import sendEmail from '../services/email.service.js'
import {generateOTP, getOTPHtml} from '../utils/utils.js'
import otpModel from '../models/otp.model.js'

// All the validations(validationRules) and verifications(isUserRegistered) hav being done 
// Now store user's Credentials in DB with --> hased password
const registerUser=async(req, res)=>{

    const {username, email, password}=req.body;

    // first hash user's password--> crypto
    const hashedPassword=await crypto.createHash("sha256").update(password).digest("hex");    

    // Now store user Credentials in Database with hashed Password            
    const user=await userModel.create({                                      
        Username: username,                                  // OR 
        Email: email,                                   // const user = new User({ username, email, password: hashedPassword });
        Password: hashedPassword                        // await user.save();                   
    })

    // generate OTP
    const otp=generateOTP();
    const html=getOTPHtml(otp);  // send OTP to the user's registered email

    // create OTPHash
    const OTPHash=crypto.createHash("sha256").update(otp).digest("hex");

    // store into the database 
    await otpModel.create({

        Email: user.Email,
        User: user._id,
        OTPHash: OTPHash
    })

    await sendEmail(email, "OTP Verification", `Your OTP code is ${otp}`, html)

    // return response
    return res.status(201).json({

        message: "User registered Successfully",
        
        User: {
            Username: user.Username,
            Email: user.Email,
            Password: user.Password,
            Verified: user.Verified
        },
    })

}

// login API
const login=async(req, res)=>{

    // take email, password
    const{email, password}=req.body;

    // check If the email exists
    const user=await userModel.findOne({
        Email:email
    });

    if(!user)
    {
        return res.status(401).json({

            message: "Invalid email"
        })
    }

    // verify user--> Is not till that time we will create access token and refresh token
    if(!user.verified)
    {
        return res.status(401).json({

            message: "Email not verified"
        })
    }

    // verify password
     // 1--> create hash of password because Prevoius entered Password was stored in hash format in DB
    const hashPassword=crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid=hashPassword === user.Password;

    // 2--> verify it
    if(!isPasswordValid)
    {
        return res.status(401).json({

            message: "Invlaid Password"
        })
    }

    // Now user email, password is correct create token--> 1) Refresh token, 2)access token
    // 1--> refreshToken -- stored in user's cookie(client side) in secure format(HttpOnly)
                            // used for generating new accesToken when it gets expired
    const refreshToken=jwt.sign({
        id: user._id,
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"    // long lived
        });

    // hash refreshToken 
    const refreshTokenHash=crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Now create session of the user for maintaning the session for every user at client side
    const session=await sessionModel.create({
        userId: user._id,
        refreshTokenHash, // store hashed refreshToken inside the session of user
        ip: req.ip,
        userAgent: req.headers["user-agent"] 
    });

    // 2--> create accessToken-- used for doing request giving access to Protected API'
                              // stored at client side in Memory
    const accessToken=jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET, 
        {
            expiresIn: "15m"     // short lived
        });

    // Now store refreshToken inside user's cookie(HttpOnly)
    res.cookie("refreshToken", refreshToken,
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days 
        }
    )

    // send response (In response send accesToken)
    return res.status(200).json({

        message: "User logged In Successfully",

        user:{
            Email: user.Email,
            Password: user.Password
        },
        accessToken
    })
}

const getMe=async(req, res)=>{

    // take the token which is send by the user from headers under authorization
    const token=req.headers.authorization?.split(" ")[1];

    if(!token)
    {
        return res.status(409).json({

            message: "token not found"
        })
    }

    // verify the token with which you have created it initiallly
    const decoded=jwt.verify(token, config.JWT_SECRET);

    const user=await userModel.findById(decoded.id);

    return res.status(200).json({

        message: "User fetched Successfully",

        User: {
            Username: user.Username,
            Email: user.Email,
            Password: user.Password
        }
    })
}

// API logic for refreshing access token
const refreshToken=async(req, res)=>{

    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken)
    {
        return res.status(401).json({

            message: "Unauthenticated, refresh token not found"
        })
    }

    // verify refreshToken with Previously created one
    const decoded=jwt.verify(refreshToken, config.JWT_SECRET);

    // Do not directly generate accessToken 
    // First Check session is revoked or not which is created by using refreshToken if false then only create
    // generate another access token

    // Hash refresh Token to check session is revoked or not
    const refreshTokenHash=await crypto.createHash("sha256").update(refreshToken).digest("hex");

    // Check if the session is revoked means user is logout
    const session=await sessionModel.findOne({
        refreshTokenHash,
        revoke: false
    })

    // if the session is not found of a particular user
    // 2 cases for which session will be found
    //    1--> refreshToken is wrong means autheticated user can be hacker or attacker
    //    2--> User already have logout 
    if(!session)
    {
        return res.status(401).json({

            message: "Invalid refresh Token"
        })
    }

    const accessToken=jwt.sign({
        id: decoded._id
    }, config.JWT_SECRET, 
        {
            expiresIn: "15m"
        }
    )

    // generate new Refresh Token
    const newRefreshToken=jwt.sign({
        id:decoded._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    // Here new refreshToken is being generated so the new refreshTokenHash --> should be stored in the user's session(databse)
    const newrefershTokenHash=await crypto.createHash("sha256").update(newRefreshToken).digest("hex");

    // save new refreshTokenHash into the session database
    session.refreshTokenHash=newRefreshTokenHash;
    await session.save();

    // store new refresh token inside user cookie
    res.cookie("newRefreshToken", newRefreshToken, 
        {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7*24*60*60*1000
        }
    )

    // return response
    return res.status(200).json({

        message: "Access token refreshed Successfully",
        
        accessToken
    })
}

// logout APi
const logout=async(req, res)=>{

    const refreshToken=req.cookies.refreshToken;

    // If in the user's cookie Refresh token is not found
    if(!refreshToken)
    {
        return res.status(400).json({

            message: "Refresh token  not found"
        })
    }

    // If the Refresh Token is found then hash it because hashRefresh Token is sorted in Database for maintaining user's session
    const refreshTokenHash=await crypto.createHash("sha256").update(refreshToken).digest("hex");

    //find the session with the same refreshToken
    const session=await sessionModel.findOne({
        refreshTokenHash,
        revoke: false
    })

    // If the session is not found
    if(!session)
    {
        return res.status(400).json({

            message: "Invalid refresh token"
        })
    }

    //If the session is found then
    session.revoke=true;
    await session.save();

    res.clearCookie("refreshToken");

    return res.status(200).json({

        message: "User logged out Successfully"
    })
}

// logoutAll (means logout user from All the devices)
const logoutAll=async(req, res)=>{
    
    const refreshToken=req.cookies.refreshToken;

    if(!refreshToken)
    {
        return res.status(401).json({

            message: "Refresh token not found"
        })
    }

    // verify refresh token
    const decoded=jwt.verify(refreshToken, config.JWT_SECRET);

    // find multiple session on given refresh token by the user and revoke(true) session, and make it revoke(r)
    await sessionModel.updateMany({

        id: decoded.id,
        revoke: false
    }, 
    {
        revoke: true
    });

    // clear refreshToken form user's cookie
    res.clearCookie("refreshToken")

    // send response
    return res.status(200).json({

        message: "User logout Successfully from all the devices"
    })
}

const verifyEmail=async(req, res)=>{
    
    // take OTP and Email from user
    const {otp, email}=req.body;

    // create OTP hash
    const otpHash=crypto.createHash("sha256").update(otp).digest("hex");

    // find the user by otp, email
    const otpDoc=await otpModel.findOne({

        Email: email,
        OTPHash: otpHash
    })

    if(!otpDoc)
    {
        return res.status(400).json({

            message: "Invalid OTP"
        })
    }

    const user=await userModel.findByIdAndUpdate(
    
        otpDoc.User,
    {
        Verified: true
    })

    await otpModel.deleteMany({
        User: otpDoc.User
    })

    return res.status(200).json({

        message: "Email verified Successfully",

        User: {
            Username: user.Username,
            Email: user.Email,
            Verified: user.Verified
        }
    })
}

export default {registerUser, getMe, refreshToken, logout, logoutAll, login, verifyEmail}