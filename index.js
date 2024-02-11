import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
const __direname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__direname, './config/.env') })
import express from 'express'
import * as indexRouter from './src/module/index.router.js'

const app = express()
import connection from './DB/connection.js'
import { globalError } from './src/services/asyncHandler.js'
import cors  from "cors"
var corsOption = {
    origin: "*",
    optionsSuccessStatus: 200
}
app.use(cors("*"))
const port = 3000
const baseUrl = process.env.baseUrl
app.use(express.json())
app.use('/auth', indexRouter.authRouter)
app.use('/user', indexRouter.userRouter)
app.use('/posts', indexRouter.postRouter)
app.use('/reels', indexRouter.reelRouter)
app.use('/stories', indexRouter.storyRouter)
app.use('/chats', indexRouter.chatsRouter)
app.use('*', (req, res, next) => {
    res.send("In-valid Route pls check url or method")
})
app.use(globalError)
connection()
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))
app.use(express.json())
app.get('/', (req, res) => res.send('Hello World!'))
import * as socket from'./common/socket.js'



import { Socket } from 'socket.io'
import userModel from './DB/model/user.model.js'

const io = socket.init(server)

//first event
io.on("connection",(socket)=>{
  socket.on('updateSocketId', async(_id)=>{
    if (_id) {
      const updatedUser = await userModel.findByIdAndUpdate({_id},{socketID:socket.id},{new:true})

      }
  })
  socket.on('sendMessage', async(id)=>{

    let user = await userModel.findById({_id:id})
console.log('tosemd',user.socketID);
socket.to(user.socketID).emit('receiveMessage', 'New Message')

  })

})