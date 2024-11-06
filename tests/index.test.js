const axios2 = require("axios");
const WebSocket = require("ws");
const HTTP_SERVER_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:8080"

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
}

describe('Authentication',()=>{
    test('user signUp and duplicate entry test',async ()=>{
        const username = `pawan-${Math.random()}`
        const password = "random"
        const type = "admin"
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type
        })
        expect(response.status).toBe(200)
        
        const updatedResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type
        })

        expect(updatedResponse.status).toBe(400)
    
    })

    test('Signup request fails if the username is empty',async()=>{
        const password ="random"
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            password
        })
        expect(response.status).toBe(400)
    })

    test('user signIn test',async()=>{
        const username = `pawan-${Math.random()}`
        const password = "random"

        await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            "type":"admin"
            
        })
        
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username, 
            password
        })
        expect(response.status).toBe(200)
        expect(response.data.token).toBeDefined()

    })

    test('SignIn fails if the user enters the wrong credentials',async()=>{
        const username = `pawan-${Math.random()}`
        const password = "random"

        await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            
        })

        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            "username":"random", 
            password
        })
        expect(response.status).toBe(404)
    })

})

describe('User metadata endpoints',()=>{
    let adminToken;
    let avatarId;
    let userToken;
    const imageUrl ="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
    
    beforeAll(async()=>{
        
        const username = `pawan-${Math.random()}`
        const password = "random"
        const name = "Timmy"
        const adminSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        const adminResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username,
            password
        })
        adminToken = adminResponse.data.token    
        
        const avatarResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
            imageUrl,
            name
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        avatarId = avatarResponse.data.avatarId
        expect(avatarResponse.data.avatarId).toBeDefined()

    })
    
    test('User cant update their metadata with a wrong avatar Id',async ()=>{
        const avatarId = "123"
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/user/metadata`,{
            avatarId
        },{
            "headers":{
                authorization: `Bearer ${adminToken}`
            }
        })
        expect(response.status).toBe(400)
    })

    test('User can update their metadata with a right avatar Id', async ()=>{
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/user/metadata`,{
            avatarId
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        expect(response.status).toBe(200)
    })

    test('User authorisation not provided', async()=>{
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/user/metadata`,{
            avatarId
        })
        expect(response.status).toBe(403)
    })
  
})

describe('User avatar Information', () =>{
    let token;
    let avatarId;
    let userId;
    const imageUrl ="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s"
    beforeAll(async()=>{

        const username = `pawan-${Math.random()}`
        const password = "random"
        const name = "Timmy"
        
        const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        userId = signUpResponse.data.userId

        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username,
            password
        })
        token = response.data.token    

        const avatarResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
            imageUrl,
            name
        },{
            headers:{
                authorization: `Bearer ${token}`        
            }
        })
        avatarId = avatarResponse.data.avatarId
        expect(avatarResponse.data.avatarId).toBeDefined()

    })
    
    test("Get back avatar information for a user", async () => {
        console.log("asking for user with id " + userId)
        const response = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        console.log("response was " + userId)
        console.log(JSON.stringify(response.data))
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    })

    test('Get available avatars',async ()=>{
        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/avatars`)
        expect(response.data.avatars.length).not.toBe(0)
        
        const currentAvatars = response.data.avatars.find(x=>x.id==avatarId)
        expect(currentAvatars).toBeDefined()

    })
})

describe('Space information', () => { 
    let avatarId;
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    let spaceId;
    let element1Id;
    let element2Id;
    let mapId;
    const dimensions = "100x200"

    beforeAll(async()=>{
        
        const username = `pawan-${Math.random()}`
        const password = "random"
        const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
        const name = "Timmy"
        
        const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        adminId = signUpResponse.data.userId

        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username,
            password
        })
        adminToken = response.data.token    
        const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username:username+"-user",
            password,
            type: "user"
        })
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username:username+"-user",
            password
        })
        userToken = userSigninResponse.data.token    

        const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        const elementResponse2 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        element1Id = elementResponse1.data.id
        element2Id = elementResponse2.data.id
    
        const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                  elementId: element2Id,
                    x: 18,
                    y: 20
                }
            ]
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id

    })
    
    test('create a space',async ()=>{    
        const name = "test"
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            name,
            dimensions,
            mapId
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        spaceId = response.data.spaceId;
        expect(response.data.spaceId).toBeDefined()
    })
    test('user is able to create a space without mapId',async ()=>{
        const name = "test"
        const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            name,
            dimensions,
            
        },{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        expect(spaceResponse.data.spaceId).toBeDefined()
    })
    
    test('user is not able to create a space without mapId and dimension',async()=>{
        const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            "name":"test",
        
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        expect(spaceResponse.status).toBe(400)
    })
    test("User is not able to delete a space that doesnt exist", async () => {
        const response = await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/randomIdDoesntExist`, {
            headers: {
                authorization: `Bearer ${userToken}`
            }
        })

       expect(response.status).toBe(400)
    })
    test('user is able to delete the space',async()=>{

        const space = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            "name":"test",
            dimensions,
            
        },{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        
        const response = await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/${space.data.spaceId}`,{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(200)
       
    })

    test('Admin has no spaces initially',async ()=>{
        const adminResponse = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/all`,{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })

        expect(adminResponse.data.spaces.length).toBe(0)
        const spaceCreateResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/`,{
            "name": "test",
            dimensions
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/all`);
        const filteredSpaces = response.data.spaces.find(x=>x.id==spaceCreateResponse.spaceId)
        expect(response.spaces.length).toBe(1)
        expect(filteredSpaces.length).toBeDefined()
    })

})

describe('Arena Endpoints',()=>{
    let avatarId;
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    let spaceId;
    let element1Id;
    let element2Id;
    let mapId;
    const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"

    beforeAll(async()=>{
        
        const username = `pawan-${Math.random()}`
        const password = "random"
        const name = "Timmy"
        
        const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        adminId = signUpResponse.data.userId

        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username,
            password
        })
        adminToken = response.data.token    
        
        const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username: username+"-user",
            password,
            type: "user"
        })
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username:username+"-user",
            password
        })
        userToken = userSigninResponse.data.token    

        const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        const elementResponse2 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        element1Id = elementResponse1.data.id
        element2Id = elementResponse2.data.id
    
        const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id

        const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            "name": "test",
            "dimensions": "100x200",
            "mapId": mapId

        },{
            headers:{
                authorization:`Bearer ${userToken}` 
            }
        })
        spaceId = spaceResponse.data.spaceId

    })
    test("Incorrect space Id return a 400",async()=>{
        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/1233`,{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })
    test('Correct spaceId',async()=>{
        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`,{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        expect(response.data.dimensions).toBe("100x200")
        expect(response.data.elements.length).toBe(3)
    })

    test('Delete an element',async()=>{

        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`);
        const a = await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/element`,{
            spaceId: spaceId,
            "id":response.data.elements[0].id
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        const newResponse = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`);
        
        expect(newResponse.data.elements.length).toBe(2)
    })

    test('Adding an element',async()=>{
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/element`,{
            "elementId":element1Id,
            "spaceId":spaceId,
            "x":50,
            "y":20
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(200)
    })
    test('Adding an element outside the dimensions',async()=>{
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/element`,{
            "elemenId":"chair",
            spaceId,
            "x":50000,
            "y":20000
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })

})

describe('Admin Endpoints', () => { 

    let avatarId;
    let userId;
    let userToken;
    let adminId;
    let adminToken;
    let spaceId;
    let mapId;
    const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"

    beforeAll(async()=>{
        
        const username = `pawan-${Math.random()}`
        const password = "random"
        const name = "Timmy"
        
        const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username,
            password,
            type: "admin"
        })
        adminId = signUpResponse.data.userId

        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username,
            password
        })
        adminToken = response.data.token    
        
        const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
            username: username+"-user",
            password,
            type: "user"
        })
        userId = userSignUpResponse.data.userId

        const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
            username:username+"-user",
            password
        })
        userToken = userSigninResponse.data.token    

        const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
            "name": "test",
            "dimensions": "100x200"
        })
        spaceId = spaceResponse.data.spaceId

    })

    test('User not able to hit admin endpoints',async()=>{
        
        const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(403)
        const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        expect(mapResponse.status).toBe(403)

        const createAvatarResponse= await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "timmy"
        },{
            headers:{
                authorization: `Bearer ${userToken}`
            }
        })
        
        expect(createAvatarResponse.status).toBe(403)
    })

    test('Admin is able to hit admin end points',async()=>{
        const elementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "100 person interview room",
            "defaultElements": []
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = mapResponse.data.id
        const createAvatarResponse= await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "timmy"
        },{
            headers:{
                authorization: `Bearer ${adminToken}`
            }
        })
          const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        expect(elementResponse.status).toBe(200)
        expect(mapResponse.status).toBe(200)
        expect(createAvatarResponse.status).toBe(200)
    })
    test('Admin is able to update the image URl for an element', async()=>{
        const elementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width":1,
            "height":1,
            "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        const updateElementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
            imageUrl,
            "width": 1,
            "height": 1,
          "static": true
        },{
            headers:{
                authorization:`Bearer ${adminToken}`
            }
        })
        expect(updateElementResponse.status).toBe(200)
    })
})


describe("Websocket tests", () => { 
    let adminToken;
    let adminUserId;
    let userToken;
    let adminId;
    let userId;
    let mapId;
    let element1Id;
    let element2Id;
    let spaceId;
    let ws1; 
    let ws2;
    let ws1Messages = [] //admin
    let ws2Messages = [] //user
    let userX;
    let userY;
    let adminX;
    let adminY;
    function waitForAndPopLatestMessage(messageArray) {
        return new Promise(resolve => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messageArray.length > 0) {
                        resolve(messageArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {
        const username = `pawan-${Math.random()}`
        const password = "123456"
        const adminSignupResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        const adminSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`, {
            username,
            password
        })
        adminUserId = adminSignupResponse.data.userId;
        adminToken = adminSigninResponse.data.token;
        
        const userSignupResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`, {
            username: username + `-user`,
            password,
            type: "user"
        })
        const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`, {
            username: username + `-user`,
            password
        })
        userId = userSignupResponse.data.userId
        userToken = userSigninResponse.data.token
        const element1Response = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        });

        const element2Response = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`, {
            "imageUrl": "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
            "width": 1,
            "height": 1,
          "static": true
        }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        element1Id = element1Response.data.id
        element2Id = element2Response.data.id

        const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`, {
            "thumbnail": "https://thumbnail.com/a.png",
            "dimensions": "100x200",
            "name": "Defaul space",
            "defaultElements": [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                  elementId: element1Id,
                    x: 18,
                    y: 20
                }, {
                  elementId: element2Id,
                    x: 19,
                    y: 20
                }
            ]
         }, {
            headers: {
                authorization: `Bearer ${adminToken}`
            }
         })
         mapId = mapResponse.data.id

        const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`, {
            "name": "Test",
            "dimensions": "100x200",
            "mapId": mapId
        }, {headers: {
            "authorization": `Bearer ${userToken}`
        }})

        spaceId = spaceResponse.data.spaceId
    }
    async function setupWs() {
        ws1 = new WebSocket(WS_URL)

        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }
        await new Promise(r => {
          ws1.onopen = r  
        })

        ws2 = new WebSocket(WS_URL)

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }
        await new Promise(r => {
            ws2.onopen = r  
        })
    }
    
    beforeAll(async () => {
        await setupHTTP()
        await setupWs()
    })

    test("Get back ack for joining the space", async () => {
        ws1.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": adminToken
            }
        }))
        const message1 = await waitForAndPopLatestMessage(ws1Messages);
        ws2.send(JSON.stringify({
            "type": "join",
            "payload": {
                "spaceId": spaceId,
                "token": userToken
            }
        }))

        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);
        
        expect(message1.type).toBe("space-joined")
        expect(message1.payload.users.length).toBe(0)
        expect(message2.type).toBe("space-joined")
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-joined");
        
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);


        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })
    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 1000000,
                y: 10000
            }
        }));

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })  

    test("User should not be able to move two blocks at the same time", async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }));


        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected")
        expect(message.payload.x).toBe(adminX)
        expect(message.payload.y).toBe(adminY)
    })

    test("Correct movement should be broadcasted to the other sockets in the room",async () => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }));
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement")
        expect(message.payload.x).toBe(adminX + 1)
        expect(message.payload.y).toBe(adminY)
    })

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close()
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left")
        expect(message.payload.userId).toBe(adminUserId)
    })
})