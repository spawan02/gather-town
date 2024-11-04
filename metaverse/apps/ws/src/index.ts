import { WebSocketServer, WebSocket } from "ws";
import express from "express"

const app = express()
const httpServer = app.listen(8080)

const wss = new WebSocketServer({server: httpServer})

wss.on('connection',(ws)=>{
    ws.on('open',()=>{
        console.log("Server connected")
    })
    ws.on('message',(message)=>{
        handleMessage(message,ws)
    })
})

const handleMessage=(message:any,ws:WebSocket)=>{

}