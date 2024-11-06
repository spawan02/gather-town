import express from "express"
import cors from "cors"
import router from "./routes/index"

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

app.use("/api/v1", router)

app.listen(PORT, ()=>console.log(`server listening on ${PORT}`));