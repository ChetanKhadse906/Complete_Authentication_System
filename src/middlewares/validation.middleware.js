import {body, validationResult} from 'express-validator'

const validateResult=(req, res, next)=>{

    const errors=validationResult(req);

    if(!errors.isEmpty())
    {
        return res.status(404).json({

            Error: errors.array()
        })
    }

    next();
}


const ValidationRules=[
    
    body("username")
        .isString()
        .withMessage("Username must be in String")
        .isLength({min:3 , max:25})
        .withMessage("Username must be between 3 to 25 words"),

    body("email")
        .isEmail()
        .withMessage("Enter a valid email"),
    
    body("password")
        .isLength({ min:6 })
        .withMessage("Password must be at least 6 characters Strong"),

        validateResult


]

export default {ValidationRules}