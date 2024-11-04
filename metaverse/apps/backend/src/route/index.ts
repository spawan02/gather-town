import express from "express"
import adminRouter from "./admin"
import userRouter from "./user"
import spaceRouter from "./space"
import { signUpSchema, signInSchema } from "../types"
import jwt from "jsonwebtoken"
import client from "@repo/db/client"
import {hashPassword,comparePassword} from "../utils"
import { JWT_PASSWORD } from "../config"


const router = express.Router()

router.post('/signup', async(req,res)=>{
    const validation = signUpSchema.safeParse(req.body)
    if(!validation.success){
        res.status(400).json({
            message: "Invalid Entry"
        })
        return
    }
    
    const hashedPassword = await hashPassword(validation.data.password)

    if(!hashedPassword) {
        res.status(400).json({message: "internal server error"})
        return
    }
    try{ 
        const user = await client.user.create({
            data:{
                username: validation.data.username,
                password: hashedPassword,
                role: validation.data.type === "admin"? "Admin" : "User"
            }
        })
        res.status(200).json({
            userId: user.id
        })
    }catch(e){
        res.status(400).json({
            message: "user already exists"
        })
    }
   
})
router.post('/signin', async(req,res)=>{
    
    const validation = signInSchema.safeParse(req.body)
    if(!validation.success){
        res.status(404).json({
            message: "Incorrect Details"
        })
        return
    }
    try{
        const user = await client.user.findUnique({
            where:{
                username: validation.data.username
            }
        })
        if(!user){
            res.status(404).json({
                message: "User not found"
            })
            return
        }
        const valid = await comparePassword(validation.data.password, user.password)
        if(!valid){
            res.status(404).json({
                mes: "Incorrect password"
            })
            return
        }
        const token = jwt.sign({
            userId: user.id,
            role: user.role
        },JWT_PASSWORD)
        res.status(200).json({token})

    }catch(e){
        res.status(400).json({  
            message: "Internal Error"
        })
    }
    
})

router.get('/avatars',async (_,res)=>{
    const avatars = await client.avatar.findMany()
    res.json({
        avatars: avatars.map(x=>({
            id: x.id,
            imageUrl: x.imageUrl,
            name: x.name
        }))
    })
})

router.get('/elements',async(_,res)=>{
    const elements = await client.element.findMany()
    res.json({
        elements:elements.map(x=>({
            id: x.id,
            imageUrl: x.imageUrl,
            width: x.width,
            heigth: x.height,
            sataic: x.static
        }))
    })

})

router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/space', spaceRouter)

export default router;