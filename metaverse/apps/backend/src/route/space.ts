import express from "express"
import { addElementSchema, createSpaceSchema, deleteElementSchema } from "../types"
import { userMiddleware } from "../middlewares/user"
import client from "@repo/db/client"

const router = express.Router()

router.post('/',userMiddleware,async(req,res)=>{
    const validation = createSpaceSchema.safeParse(req.body)
    if(!validation.success){
        res.status(400).json({
            message: "Invalid entry"
        })
        return 
    }
    if(!validation.data.mapId){
        const space = await client.space.create({
            data:{
                name: validation.data.name,
                width: parseInt(validation.data.dimensions.split("x")[0]),
                height: parseInt(validation.data.dimensions.split("x")[1]),
                creatorId: req.userId!
            }
        });
        res.status(200).json({spaceId:space.id})
        return
    }
    const map = await client.map.findFirst({
        where:{
            id: validation.data.mapId
        },select:{
            mapElements: true, 
            width: true,
            height: true
        }
    })
    if(!map){
        res.status(400).json({
            message: "map not found"
        })
        return 
    }
    let space = await client.$transaction(async()=>{
        const space = await client.space.create({
            data:{
                name: validation.data.name,
                width: parseInt(validation.data.dimensions.split("x")[0]),
                height: parseInt(validation.data.dimensions.split("x")[1]),
                creatorId: req.userId!
            }
        })
        await client.spaceElements.createMany({
            data: map.mapElements.map(x=>({
                    spaceId: x.id,
                    elementId: x.elementId,
                    x: x.x!,
                    y: x.y!
                }))
        })
        return space
    })
    res.json({})
})

router.post('/element',userMiddleware,async(req,res)=>{

    const {elementId, x, y, spaceId}  = req.body
    const validataion = addElementSchema.safeParse(req.body)
    if(!validataion.success){
        res.status(400).json({
            message: "Invalid entry"
        })
        return
    }
    const space = await client.space.findFirst({
        where:{
            id: validataion.data.spaceId,
            creatorId: req.userId
        },select:{
            height: true, 
            width: true
        }
    })
    if(!space){
        res.status(400).json({
            message: "Unauthorised space"
        })
        return
    }
    if(x<0 || y<0 || x > space.width ||y> space.height ){
        res.status(400).json({
            message: "Point is outside the space"
        })
    }
    await client.spaceElements.create({
        data:{
            elementId,
            spaceId,
            x,
            y,
        }
    })
    res.status(200).json({
        message: "element added"
    })
})

router.get("/all",async(req,res)=>{
    const space = await client.space.findMany({
        where: {
            creatorId: req.userId
        }
    })
    res.status(200).json({
         spaces: space.map(x=>({
            id: x.id,
            name: x.name,
            dimensions: `${x.width} x${x.height}`,
            thumbnail: x.thumbnail
         }))
    })
})

router.get('/:spaceId',async(req,res)=>{
    const {spaceId} = req.params;
    const space = await client.space.findFirst({
        where:{
            id: spaceId
        },include:{
            elements:{
                include:{
                    element:true
                }
            }
        }
    })
    if(!space){
        res.status(400).json({
            message: "Invalid space"
        })
        return
    }
    res.status(200).json({
        dimension: `${space.width}x${space.height}`,
        elements: space.elements.map(x=>({
            id: x.id,
            element:{
                id: x.element.id,
                imageUrl: x.element.imageUrl,
                static: x.element.static,
                height: x.element.height,
                width: x.element.width
            },
            x: x.x,
            y:x.y
        })),
    })
})


router.delete('/:spaceId',userMiddleware,async(req,res)=>{
    const {spaceId} = req.params
    const space = await client.space.findUnique({
        where:{
            id: spaceId,
        },select:{
            creatorId: true
        }
    })
    if(!space){
        res.status(400).json({
            message: "space not found"
        })
        return 
    }
    if(space.creatorId!==req.userId){
        res.status(403).json({
            message: "User is unauthorised to delete the space"
        })
        return
    }
    await client.space.delete({
        where:{
            id: spaceId
        }
    })
    res.status(200).json({
        message: "space deleted"
    })

})

router.delete("/element",userMiddleware,async(req,res)=>{
    const validData = deleteElementSchema.safeParse(req.body)
    if(!validData.success){
        res.status(400).json({
            message: "Invalid details"
        })
        return
    }
    const element = await client.spaceElements.findFirst({
        where: {
            id: validData.data.id
        },
        include:{
            space:true
        }
    })
    if(!element?.space.creatorId||element?.space.creatorId !== req.userId){
        res.status(400).json({
            message: "Unauthorised"
        })
        return
    }
    await client.spaceElements.delete({
        where:{
            id: validData.data.id
        }
    })
    res.status(200).json({
        message: "element deleted"
    })

})

export default router
