import { WebSocketServer, WebSocket } from "ws";
import express from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { JWT_PASSWORD } from "./config";
import client from "@repo/db/client"

const app = express()
const httpServer = app.listen(8080)

const wss = new WebSocketServer({server: httpServer})
let userRoom: Map<string, string[]> = new Map();
let userWsMap: Map<string, WebSocket> = new Map();
let userPositionMap: Map<string, { x: number, y: number }> = new Map(); 

wss.on('connection',(ws)=>{
    ws.on('open',()=>{
        console.log("Server connected")
    })
    ws.on('message',(message)=>{
        handleMessage(message,ws)
    })
    ws.on('close',()=>{
        console.log("Server disconnected")
    })
})

const handleMessage = async(message:any,ws:WebSocket)=>{
    const parsedData = JSON.parse(message.toString())
    const spaceId = parsedData.payload.spaceId;
        const token = parsedData.payload.token;
        let x,y;
        let userId:string;
        let space;
        switch(parsedData.type){
            case "join":{
            userId = (jwt.verify(token,JWT_PASSWORD)as JwtPayload).userId
            if(!userId){
                ws.close()
                return
            }
            space = await client.space.findFirst({
                where:{
                    id: spaceId
                }
            })
            if(!space){
                ws.close()
                return
            }
            if(!userRoom.has(spaceId)){
                userRoom.set(spaceId, [userId]) 
            }else{
                userRoom.get(spaceId)?.push(userId); 
            }
            userWsMap.set(userId, ws);

            x = (Math.floor(Math.random() * space.width))
            y = (Math.floor(Math.random() * space.height))
            userPositionMap.set(userId, { x, y });
            const spaceJoined = {
                "type": "space-joined", 
                "payload": {
                    "spawn": {
                        "x": x,
                        "y": y
                    },
                    users: userRoom.get(spaceId)?.filter(x=>x!==userId).map(u=> ({id: userId})) ?? []
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
            if(!userRoom.get(spaceId)){
                return;
            }
            const roomUsers = userRoom.get(spaceId);
            if (roomUsers) {
                roomUsers.forEach(u => {
                    // Don't send to the user who just joined
                    if (u !== userId) {
                        const otherWs = userWsMap.get(u);
                        if (otherWs) {
                            otherWs.send(JSON.stringify(BroadcastChannel));
                        }
                    }
                });
            }

        }
        break;
        case "move":
            const currentX = 'adminX';  
            const currentY = 'adminY';  
            console.log("space width", space)
            console.log("x", x)
            let moveX = parsedData.payload.x;
            let moveY = parsedData.payload.y;
            if(moveX<0) moveX=0;
            if(moveX>space!.width) moveX = space!.width 
            if(moveY<0) moveY=0;
            if(moveY>space!.width) moveY = space!.height 
            const xDisplacement = Math.abs(x! - moveX);
            const yDisplacement = Math.abs(y! - moveY);
            if(moveX!==parsedData.payload.x || moveY!== parsedData.payload.y){
                ws.send(JSON.stringify({
                    type: "movement-rejected",
                    payload: {
                        x: currentX,
                        y: currentY
                    }
                }));            
               
            }
            if ((xDisplacement == 1 && yDisplacement== 0) || (xDisplacement == 0 && yDisplacement == 1)) {
                x = moveX;
                y = moveY;
                const BroadcastChannel ={
                    type: "movement",
                    payload: {
                        x: x,
                        y: y
                    }
                }
                const roomUsers = userRoom.get(spaceId);
                if (roomUsers) {
                    roomUsers.forEach(u => {
                        // Don't send to the user who just joined
                        if (u !== userId) {
                            const otherWs = userWsMap.get(u);
                            if (otherWs) {
                                otherWs.send(JSON.stringify(BroadcastChannel));
                            }
                        }
                    });
                }
            }
            break;
           
    }
}