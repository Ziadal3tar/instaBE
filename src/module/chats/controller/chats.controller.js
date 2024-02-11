import userModel from '../../../../DB/model/user.model.js'

import { asyncHandler } from '../../../services/asyncHandler.js';
import { findById, findByIdAndDelete, findOneAndUpdate, findOne, find, findByIdAndUpdate, create, findOneAndDelete } from '../../../../DB/DBMethods.js';
import chatsModel from '../../../../DB/model/chat.model.js';


export const sendMessage = asyncHandler(async (req, res, next) => {
    const sender = req.user._id;
    const { to, message,time } = req.body;
    const userIds = [to, sender]; // Array of user IDs

    const newMessage = {
        message,
        sender,
        time
    };

    // Find the chat
    let chat = await chatsModel.findOne({ userIds: { $all: userIds } });

    if (chat) {
        // If chat exists, update the messages
        chat.messages.push(newMessage);
        await chat.save();
    } else {
        // If chat doesn't exist, create a new one
        const newChat = new chatsModel({ userIds });
        newChat.messages.push(newMessage);
        chat = await newChat.save();
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            let updateUsersChats = await userModel.findByIdAndUpdate(
                userId,
                { $addToSet: { chats: chat._id } }
            );
        }
    }

    res.status(200).json({ success: true, data: chat });
});
export const getChat = asyncHandler(async (req, res, next) => {
    const sender = req.user._id;
    const { to } = req.body;
    const userIds = [to, sender]; // Array of user IDs

    let chat = await findOne({model:chatsModel,condition:{ userIds: { $all: userIds } }})
let user = await findById({model:userModel,condition:to})
res.status(200).json({ user, chat });

});