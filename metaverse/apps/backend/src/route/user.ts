import express from "express"
import { userMiddleware } from "../middlewares/user"
import { updateMetadataSchema } from "../types"
import client from "@repo/db/client"
const router  = express.Router()

router.post('/metadata',userMiddleware,async (req,res)=>{
    const validation =  updateMetadataSchema.safeParse(req.body);
    if(!validation.success){
        res.status(400).json({
            message: "validation failed"
        })
    }
    
    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data:{
                avatarId: validation.data?.avatarId
            }
        })
        res.status(200).json({
            message: "Avatar updated"
        })
    }catch(e){
        res.status(400).json({
            message: "Server Error"
        })
    }

})
router.get('/metadata/bulk',async(req,res)=>{
    const userIdString = req.query.ids as string
    const userIds = userIdString?.slice(1, userIdString.length-1).split(",")
    const metadata = await client.user.findMany({
        where:{
            id: {
                in: userIds
            }
        },
        select:{
            avatar: true, 
            id:true
        }
    })
    res.status(200).json({
        avatars: metadata.map(x=>({
            userId: x.id,
            avatarId: x.avatar?.imageUrl
        }))
    })
})


export default router