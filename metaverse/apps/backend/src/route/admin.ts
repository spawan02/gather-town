import express from "express"
import { adminCreateElement, createAvatar, createElement, createMap } from "../types"
import { adminMiddleware } from "../middlewares/admin"
import client from "@repo/db/client"

const router  = express.Router()
router.use(adminMiddleware)
router.post("/element",async(req,res)=>{
    const { imageUrl, width, height } = req.body
    const validataion = adminCreateElement.safeParse(req.body)
    if(!validataion.success){
        res.status(400).json({
            message: 'Invalid entry'
        })
        return
    }
    const element = await client.element.create({
        data:{
            imageUrl,
            width,
            height,
            static: validataion.data.static
        }
    })
    res.status(200).json({
        id: element.id
    })

})

router.put('/element/:elementId',async(req,res)=>{
    const {elementId} = req.params;
    const validation = createElement.safeParse(req.body)
    if(!validation.success){
        res.status(400).json({
            message: "Invalid entry"
        })
        return
    }
    const element = await client.element.update({
        where: {
            id: elementId
        },
        data:{
            imageUrl: validation.data.imageUrl
        }
    })
    res.status(200).json({
        message: "Element update"
    })
})

router.post('/avatar',async(req,res)=>{
    const validation = createAvatar.safeParse(req.body)
    if(!validation.success){
        res.status(400).json({
            message: "Invalid entry"
        })
        return
    }
    const avatar = await client.avatar.create({
        data:{
            imageUrl: validation.data.imageUrl,
            name: validation.data.name
        }
    })
    res.status(200).json({
        avatarId: avatar.id
    })

})

router.post("/map",async(req,res)=>{
    const validataion = createMap.safeParse(req.body)
    if(!validataion.success){
        res.status(400).json({
            message: "Invalid entry"
        })
        return
    }
    const map = await client.map.create({
        data:{
            width: parseInt(validataion.data?.dimensions.split("x")[0]),
            height: parseInt(validataion.data?.dimensions.split("x")[1]),
            name: validataion.data.name,
            thumbnail: validataion.data.thumbnail,
            mapElements: {
                create: validataion.data.defaultElements.map(x=>({
                    elementId: x.elementId,
                    x: x.x,
                    y: x.y
                }))
        }}
    })
    res.status(200).json({
        id: map.id
    })
})

export default router