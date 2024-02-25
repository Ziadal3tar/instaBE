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
import cors from "cors"
var corsOption = {
  origin: "*",
  optionsSuccessStatus: 200
}
app.use(cors(corsOption))
const port = process.env.PORT || 3000
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
import * as socket from './common/socket.js'
import * as notification from './common/notification.js'



import { Socket } from 'socket.io'
import userModel from './DB/model/user.model.js'

const io = socket.init(server)

//first event
io.on("connection", (socket) => {

  socket.on('updateSocketId', async (_id) => {
    if (_id) {
      const updatedUser = await userModel.findByIdAndUpdate({ _id }, { socketID: socket.id }, { new: true })
    }
  })


  socket.on('notification', async (data) => {
    const userPop = [
      {
          path: "posts",
    
          populate: [
              {
                  path: "createdBy",
                
              },
              {
                  path: "comments",
                  populate: [
                      {
                          path: "userId",
                      },
                  ]
              },
          ]
      },
      {
          path: "visited",
      },
      {
        path: "chats",
    },
      {
        path: "stories",
    },
      {
          path: "saved",
      },
      {
          path: "following",
          populate: [
            {
                path: "stories",
            },]
      },
      {
        path: "chats",
        populate: [
          {
              path: "userIds",
          },
         
      ]
      }
      , {
        path: "collections.saved",
    
      }
      , {
        path: "notifications.data",
      }
    ];
    let user = await userModel.findById({ _id: data.data })
// console.log(user); 
    let text
    // if (data.eventName == 'message') {
    //     text = `${notification.notification[data.eventName]} ${user.userName}`
    //   }else if (data.eventName == 'suggest') {
    //     text = `${user.userName} ${notification.notification[data.eventName]}`
    //   

    if (data.eventName == 'follow' || data.eventName == 'comment' || data.eventName == 'like' || data.eventName == 'message') {
      if (data.eventName == 'message') {
        text = `${notification.notification[data.eventName]} ${user.userName}`
      } else {
        text = `${user.userName} ${notification.notification[data.eventName]}`
      }
      let to = await userModel.findById({ _id: data.to })
      let notificationData = {
        text,
        data: data.data,
        redirect: data.redirect,
        type: data.type,

      }
      let addNotification = await userModel.findByIdAndUpdate(
        { _id: data.to },
        { $push: { notifications: notificationData } },
        { new: true }
      );
      if (addNotification) {
        socket.to(to.socketID).emit('notification', 'New notification')
      }
    } else if (data.eventName == 'addPost' || data.eventName == 'addStory') {
      const text = `${user.userName} ${notification.notification[data.eventName]}`;
      const notificationData = {
        text,
        data: user,
        redirect: data.redirect,
        type: data.type,
      };

      for (const element of user.followers) {
        const addNotification = await userModel.findByIdAndUpdate(
          element,
          { $push: { notifications: notificationData } },
          { new: true }
        ).select('socketID');
        socket.to(addNotification.socketID).emit('notification', 'New notification');
      }


    }
  })

})