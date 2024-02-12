import * as socket from './common/socket.js'
import userModel from './DB/model/user.model.js'
import connection from './DB/connection.js'
import express from 'express'
import * as indexRouter from './src/module/index.router.js'
import { globalError } from './src/services/asyncHandler.js'
import cors from "cors"
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.join(__dirname, './config/.env') })

const app = express()
const port = process.env.PORT || 3000;

// CORS setup
app.use(cors({
  origin: 'https://www.al3tar.me'
}));

const baseUrl = process.env.baseUrl

app.use(express.json())
app.use('/auth', indexRouter.authRouter)
app.use('/user', indexRouter.userRouter)
app.use('/posts', indexRouter.postRouter)
app.use('/reels', indexRouter.reelRouter)
app.use('/stories', indexRouter.storyRouter)
app.use('/chats', indexRouter.chatsRouter)

app.use('*', (req, res, next) => {
    res.send("Invalid Route please check url or method")
})

app.use(globalError)

// Establish database connection
connection()

// HTTP Server
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`))

// Socket.io setup
const io = socket.init(server)

// WebSocket connection handling
io.use((socket, next) => {
  // Extract the origin from the request
  const origin = socket.handshake.headers.origin;
  // Check if the origin is allowed
  if (origin === 'https://www.al3tar.me') {
    return next();
  }
  // If not allowed, reject the connection
  return next(new Error('Not allowed by CORS'));
});

// Event handling
io.on("connection", (socket) => {
  socket.on('updateSocketId', async (_id) => {
    if (_id) {
      const updatedUser = await userModel.findByIdAndUpdate({ _id }, { socketID: socket.id }, { new: true })
    }
  })

  socket.on('sendMessage', async (id) => {
    let user = await userModel.findById({ _id: id })
    console.log('to send', user.socketID);
    socket.to(user.socketID).emit('receiveMessage', 'New Message')
  })
})

// Handle root route
app.get('/', (req, res) => res.send('Hello World!'))
