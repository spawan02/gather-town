import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from "../config"

export const adminMiddleware = (req:Request,res:Response,next:NextFunction) =>{
    const {authorization } = req.headers
    const header = authorization?.split(" ")[1]
    if(!header){
        res.status(400).json({
            message: "Invalid token"
        })
        return
    }
    try{
        const decoded = jwt.verify(header, JWT_PASSWORD) as {userId: string, role: string}
        if(decoded.role !== "Admin"){
            res.status(403).json({
                message: "Invalid authorisation"
            })
        }
        req.userId = decoded.userId
        next()
    }catch(e){
        res.status(403).json({
            message: "Internal server error"
        })
        return
    }
}