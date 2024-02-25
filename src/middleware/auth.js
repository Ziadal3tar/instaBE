import jwt from "jsonwebtoken"
import userModel from "../../DB/model/user.model.js"
import { asyncHandler } from "../services/asyncHandler.js"
import { populate } from "dotenv"
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
      path: "savedPosts",
  },
  {
      path: "savedReels",
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
      path: "notifications.data",
  }
];
export const roles = {
  User: "User",
  Admin: "Admin"
}
export const auth = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers
    if (!authorization?.startsWith(process.env.BearerKey)) {
      res.status(400).json({ message: "In-valid Bearer Key" })
    } else {
      const token = authorization.split(process.env.BearerKey)[1]
      const decoded = jwt.verify(token, process.env.tokenSignature);
      if (!decoded?.id || !decoded?.isLoggedIn) {
        res.status(400).json({ message: "In-valid token payload" })

      } else {
        const user = await userModel
  .findById(decoded.id)
  .populate([...userPop])
  .exec();
  // await user.populate('collections.saved.savedId').execPopulate();

        if (!user) {
          res.status(404).json({ message: "Not register user" })

        } else {
            req.user = user
            next()
        }
      }
    }
  })
}

