const axios2 = require("axios");
const WebSocket = require("ws");
const HTTP_SERVER_URL = "http://localhost:3000";

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
        console.log(response.status)
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
        console.log(signUpResponse.data.userId)
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

    test('Get available avatars',async ()=>{
        const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/avatars`)
        expect(response.data.avatars.length).not.toBe(0)
        
        const currentAvatars = response.data.avatars.find(x=>x.id==avatarId)
        expect(currentAvatars).toBeDefined()

    })
})

// describe('Space information', () => { 
//     let avatarId;
//     let userId;
//     let userToken;
//     let adminId;
//     let adminToken;
//     let spaceId;
//     let element1Id;
//     let element2Id;
//     let mapId;
//     const dimensions = "100x200"

//     beforeAll(async()=>{
        
//         const username = `pawan-${Math.random()}`
//         const password = "random"
//         const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"
//         const name = "Timmy"
        
//         const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = signUpResponse.data.userId

//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username,
//             password
//         })
//         adminToken = response.data.token    
//         const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username:username+"-user",
//             password,
//             type: "user"
//         })
//         userId = userSignUpResponse.data.userId

//         const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username:username+"-user",
//             password
//         })
//         userToken = userSigninResponse.data.token    

//         const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         const elementResponse2 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         element1Id = elementResponse1.data.id
//         element2Id = elementResponse2.data.id
    
//         const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": [{
//                     elementId: element1Id,
//                     x: 20,
//                     y: 20
//                 }, {
//                   elementId: element1Id,
//                     x: 18,
//                     y: 20
//                 },
//                 {
//                   elementId: element2Id,
//                     x: 18,
//                     y: 20
//                 }
//             ]
//         },{
//             headers:{
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id

//     })
    
//     test('create a space',async ()=>{    
//         const name = "test"
//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             name,
//             dimensions,
//             mapId
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(response.data.spaceId).toBeDefined()
//         spaceId = response.data.spaceId;
//     })
//     test('user is able to create a space without mapId',async ()=>{
//         const name = "test"
//         const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             name,
//             dimensions,
            
//         },{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
//         expect(spaceResponse.data.spaceId).toBeDefined()
//     })
    
//     test('user is not able to create a space without mapId and dimension',async()=>{
//         const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             "name":"test",
        
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(spaceResponse.status).toBe(400)
//     })
//     test("User is not able to delete a space that doesnt exist", async () => {
//         const response = await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/randomIdDoesntExist`, {
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })

//        expect(response.status).toBe(400)
//     })
//     test('user is able to delete the space',async()=>{

//         await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             "name":"test",
//             dimensions,
            
//         },{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })

//         const response = await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`,{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
//         expect(response.status).toBe(200)
       
//     })

//     test('Admin has no spaces initially',async ()=>{
//         const adminResponse = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/all`,{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         expect(adminResponse.data.spaces.length).toBe(0)
//         const spaceCreateResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/`,{
//             "name": "test",
//             dimensions
//         },{
//             headers:{
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/all`);
//         const filteredSpaces = response.data.spaces.find(x=>x.id==spaceCreateResponse.spaceId)
//         expect(response.spaces.length).toBe(1)
//         expect(filteredSpaces.length).toBeDefined()
//     })

// })

// describe('Arena Endpoints',()=>{
//     let avatarId;
//     let userId;
//     let userToken;
//     let adminId;
//     let adminToken;
//     let spaceId;
//     let element1Id;
//     let element2Id;
//     let mapId;
//     const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"

//     beforeAll(async()=>{
        
//         const username = `pawan-${Math.random()}`
//         const password = "random"
//         const name = "Timmy"
        
//         const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = signUpResponse.data.userId

//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username,
//             password
//         })
//         adminToken = response.data.token    
        
//         const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username: username+"-user",
//             password,
//             type: "user"
//         })
//         userId = userSignUpResponse.data.userId

//         const userSigninResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username:username+"-user",
//             password
//         })
//         userToken = userSigninResponse.data.token    

//         const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         const elementResponse2 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         element1Id = elementResponse1.data.id
//         element2Id = elementResponse2.data.id
    
//         const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": [{
//                     elementId: element1Id,
//                     x: 20,
//                     y: 20
//                 }, {
//                   elementId: element1Id,
//                     x: 18,
//                     y: 20
//                 },
//                 {
//                   elementId: element2Id,
//                     x: 19,
//                     y: 20
//                 }
//             ]
//         },{
//             headers:{
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id

//         const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             "name": "test",
//             "dimensions": "100x200"
//         })
//         spaceId = spaceResponse.data.spaceId

//     })
//     test("Incorrect space Id return a 400",async()=>{
//         const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/1233`,{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
//         expect(response.status).toBe(400)
//     })
//     test('Correct spaceId',async()=>{
//         const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`,{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
//         expect(response.data.dimensions).toBe("100x200")
//         expect(response.data.elements.length).toB(3)
//     })

//     test('Delete an element',async()=>{
//         const response = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`);

//         await axios.delete(`${HTTP_SERVER_URL}/api/v1/space/element`,{
//             spaceId: spaceId,
//             "id":response.data.elements[0].id
//         },{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
        
//         const newResponse = await axios.get(`${HTTP_SERVER_URL}/api/v1/space/${spaceId}`);
//         expect(newResponse.data.elements.length).toBe(2)
//     })

//     test('Adding an element',async()=>{
//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/element`,{
//             "elemenId":"chair",
//             spaceId,
//             "x":50,
//             "y":20
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(response.status).toBe(200)
//     })
//     test('Adding an element outside the dimensions',async()=>{
//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/space/element`,{
//             "elemenId":"chair",
//             spaceId,
//             "x":50000,
//             "y":20000
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(response.status).toBe(400)
//     })

// })

// describe('Admin Endpoints', () => { 

//     let avatarId;
//     let userId;
//     let userToken;
//     let adminId;
//     let adminToken;
//     let spaceId;
//     let mapId;
//     const imageUrl ="https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE"

//     beforeAll(async()=>{
        
//         const username = `pawan-${Math.random()}`
//         const password = "random"
//         const name = "Timmy"
        
//         const signUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username,
//             password,
//             type: "admin"
//         })
//         adminId = signUpResponse.data.userId

//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username,
//             password
//         })
//         adminToken = response.data.token       
//         const userSignUpResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signup`,{
//             username,
//             password,
//             type: "admin"
//         })
//         userId = userSignUpResponse.data.userId

//         const userResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/signin`,{
//             username,
//             password
//         })
//         userToken = userResponse.data.token       
        
//         const spaceResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/space`,{
//             "name": "test",
//             "dimensions": "100x200"
//         })
//         spaceId = spaceResponse.data.spaceId

//     })

//     test('User not able to hit admin endpoints',async()=>{
//         const response = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${userToken}`
//             }
//         })
//         expect(response.status).toBe(403)
//         const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": []
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(mapResponse.status).toBe(400)

//         const createAvatarResponse= await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             "name": "timmy"
//         },{
//             headers:{
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         expect(createAvatarResponse.status).toBe(400)
//     })

//     test('Admin is able to hit admin end points',async()=>{
//         const elementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         const mapResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/map`,{
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": []
//         },{
//             headers:{
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id
//         const createAvatarResponse= await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/avatar`,{
//             "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
//             "name": "timmy"
//         },{
//             headers:{
//                 authorization: `Bearer +${adminToken}`
//             }
//         })
//           const elementResponse1 = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         expect(elementResponse.status).toBe(200)
//         expect(mapResponse.status).toBe(200)
//         expect(createAvatarResponse.status).toBe(200)
//     })
//     test('Admin is able to update the image URl for an element', async()=>{
//         console.log(imageUrl)
//         const elementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl,
//             "width":1,
//             "height":1,
//             "static": true
//         },{
//             headers:{
//                 authorization:`Bearer ${adminToken}`
//             }
//         })
//         const updateElementResponse = await axios.post(`${HTTP_SERVER_URL}/api/v1/admin/element`,{
//             imageUrl
//         },{
//             headers:{
//                 authorization:`Bearer +${adminToken}`
//             }
//         })
//         expect(updateElementResponse.status).toBe(200)
//     })
// })