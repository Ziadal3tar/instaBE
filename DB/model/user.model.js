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
        required: [true, 'password is required'],
    },
    phone: {
        type: String,
    },
    
    active: {
        type: Boolean,
        default: 'false',
    },
    confirmEmail: {
        type: Boolean,
        default: 'false',
    },
    blocked: {
        type: Boolean,
        default: 'false',
    },
    profilePic:{ 
        type:String,
        default:'https://res.cloudinary.com/dqaf8jxn5/image/upload/v1671116089/1106076_n5oakd.png'
    },
    public_id: String,
    DOB: String,
    
    
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
      reels: [
      {
        type: Types.ObjectId,
        ref: "Reel",
      },
    ],
    
    
    socketID: String,

}, {
    timestamps: true
})
userSchema.pre("save", function (next) {
    this.password = bcrypt.hashSync(this.password, parseInt(process.env.ROUNDS))
    next()
})

const userModel = model('User', userSchema);
export default userModel