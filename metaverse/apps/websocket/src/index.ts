import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";
import client from "@repo/db/client"

const wss = new WebSocketServer({port: 8080})
let userRoom: Map<string, myWS[]> = new Map();

interface myWS extends WebSocket{
    x: number, 
    y: number, 
    userId: string, 
    spaceId: string
}

async function decode(payload:any):Promise<any>{
    const token = payload.token
    const decoded = jwt.verify(token,JWT_PASSWORD)
    return decoded;
}


async function handleJoin (payload:any, ws: myWS){
    const spaceId = payload.spaceId
    const decoded = await decode(payload)
    const userId = decoded.userId
    if(!userId || typeof userId !== 'string'){
        throw new Error("Invalid token")
    }
    if(!userRoom.get(spaceId)){
        userRoom.set(spaceId,[])
    }
    const spaceUser = userRoom.get(spaceId)
    ws.userId = userId
    ws.spaceId = spaceId
    
    const space = await client.space.findFirst({
        where:{
            id: spaceId
        }

    })
    if(!space){
        throw new Error("SpaceId not found")
    }
    const exists = spaceUser?.some(ws=>ws.userId===userId)
    const x = (Math.floor(Math.random() * space!.width))
    const y = (Math.floor(Math.random() * space.height))
   
    ws.x = x
    ws.y = y
    if(spaceUser && !exists){
        spaceUser.push(ws)
    }
    const spaceJoined = {
        "type": "space-joined", 
        "payload": {
            "spawn": {
                "x": x,
                "y": y
            },
            users: userRoom.get(spaceId)?.filter(x=>x.userId!==userId).map(u=> ({id: userId})) ?? []
        }
    }   
    ws.send(JSON.stringify(spaceJoined))
    
    const BroadcastChannel = {
        "type": "user-joined",
        "payload": {
            "userId": userId,
            "x": x,
            "y": y
        }
    }
    const allUsers = userRoom.get(spaceId)
    allUsers?.forEach(x=>{
        if(x.userId!==userId){
            x.send(JSON.stringify(BroadcastChannel))
        }
    })
}
async function handleMove(payload:any, ws:myWS){
    const{x:moveX,y:moveY} = payload
    const xChange = Math.abs(ws.x-moveX)
    const yChange = Math.abs(ws.y-moveY)
    const spaceId = ws.spaceId;
    const space = await client.space.findFirst({
        where:{
            id: spaceId
        },select:{
            width:true,
            height:true
        }
    }) 
    if(!space){
        throw new Error("Invalid space")
    }
    if( xChange == 1 && yChange == 0 || xChange == 0 && yChange == 1 ){
        const message ={
            type:"movement",
            payload:{
                "x":moveX,
                "y":moveY
            }
        }
        userRoom.get(spaceId)?.forEach(x=>{
            x.send(JSON.stringify(message))
        })
    }

    const message = {
        type: "movement-rejected",
        payload:{
            x: ws.x,
            y: ws.y
        }
    }
    ws.send(JSON.stringify(message))
}

function handleLeave(ws:myWS){
    const response = {
        type: "user-left",
        payload:{
            userId: ws.userId
        }
    }
    const user = userRoom.get(ws.spaceId)?.forEach(x=>{
        if(x.userId===ws.userId){
            const a = userRoom.get(x.spaceId)?.filter(x=>x.userId!==ws.userId)
            
            if(a!.length>0){
                userRoom.set(ws.spaceId,a!)
            }else{
                userRoom.delete(ws.spaceId)
            }
            userRoom.delete(x.userId)
        }
    })
    userRoom.get(ws.spaceId)?.forEach(x=>{
        x.send(JSON.stringify(response))
    })

}   
wss.on('connection',(ws:myWS)=>{
    ws.on('open',()=>{
        console.log("Server connected")
    })
    ws.on('message',async(message)=>{
        const parsedData = JSON.parse(message.toString())
        if(!parsedData.type){
            const responseData = {
                type: "error",
                message: "type is required"
            }
            ws.send(JSON.stringify(responseData))
        }
        switch(parsedData.type){
            case "join": {
                await handleJoin(parsedData.payload,ws)
            }
            break;
            case "move":{
                handleMove(parsedData.payload,ws)
            }
            break;
            default:
                const response = JSON.stringify({
                    type: "error",
                    message: "Type invalid"
                })
                ws.send(response)
        }
        
    })
    ws.on('close',()=>{
        handleLeave(ws)
        console.log("Server disconnected")
    })
})