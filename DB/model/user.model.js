import { Schema, model, Types } from "mongoose";
import bcrypt from 'bcrypt'

const userSchema = new Schema({
  userName: {
    type: String,
    required: [true, 'userName is required'],
    min: [2, 'minimum length 2 char'],
    max: [20, 'max length 20 char']
  },
  fullName: {
    type: String,
    required: [true, 'name is required'],
    min: [2, 'minimum length 2 char'],
    max: [20, 'max length 20 char']
  },
  email: {
    type: String,
    required: [true, 'userName is required'],
    unique: [true, 'must be unique value']
  },
  password: {
    type: String,
  },
  phone: {
    type: String,
  },
  bio: {
    type: String,
  },
  active: {
    type: Boolean,
    default: 'false',
  },
  confirmEmail: {
    type: Boolean,
    default: 'true',
  },
  blocked: {
    type: Boolean,
    default: 'false',
  },
  profilePic: {
    type: String,
    default: 'https://res.cloudinary.com/dwfz5qvgr/image/upload/v1706456193/th_nbdcp8.jpg'
  },
  profilePicType: {
    type: String,
    default: 'defaultImage',
    enums: ["fbImage", "googleImage", "defaultImage", "UserImage"]
  },
  registerType: {
    type: String,
    default: 'default',
    enums: ["facebook", "google", "default"]
  },
  public_id: String,
  DOB: String,

  likes: [
    {
      type: Types.ObjectId,
      refPath: 'itemModel'
    },
  ],
  stories: [
    {
      type: Types.ObjectId,
      ref: "Story",
    },
  ],
  posts: [
    {
      type: Types.ObjectId,
      ref: "Post",
    },
  ],
  following: [
    {
      type: Types.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: Types.ObjectId,
      ref: "User",
    },
  ],
  visited: [
    {
      type: Types.ObjectId,
      ref: "User",
    },
  ],
  reels: [
    {
      type: Types.ObjectId,
      ref: "Reel",
    },
  ],
  chats: [
    {
      type: Types.ObjectId,
      ref: "Chat",
    },
  ],
  savedPosts: [

    {
      type: Types.ObjectId,
      ref: 'Post',
    }

  ],
  savedReels: [

    {
      type: Types.ObjectId,
      ref: 'Reel',
    }

  ],


  collections: [{
    collectionName: {
      type: String,
      required: [true, 'CollectionName is required'],
      min: [2, 'minimum length 2 char'],
      max: [20, 'max length 20 char']
    },

  }],
  notifications: [{
    text: { type: String },
    seen: { type: Boolean, default: false },
    type: { type: String },
    data: {
      type: Types.ObjectId,
      ref: 'User',
    },
    redirect: { type: String },
  }],


  socketID: String,

}, {
  timestamps: true
})


userSchema.pre("save", function (next) { 
  if (this.password) { 
 
    this.password = bcrypt.hashSync(this.password, parseInt(process.env.ROUNDS)) 
  } 
  next() 
}) 

const userModel = model('User', userSchema);
export default userModel