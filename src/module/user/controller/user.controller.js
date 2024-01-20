import userModel from '../../../../DB/model/user.model.js'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../../../services/asyncHandler.js';
import { findById, findByIdAndDelete, findOneAndUpdate, findOne, find, findByIdAndUpdate, create, findOneAndDelete } from '../../../../DB/DBMethods.js';
import cloudinary from '../../../services/cloudinary.js'

export const getUserData = asyncHandler(async (req, res, next) => {
    const userData = req.user
    res.status(200).json({ userData })

})
export const changeUserImage = asyncHandler(async (req, res, next) => {
let _id = req.user._id
let mainImgid = req.user.public_id

    cloudinary.uploader.upload(req.file.path, { folder: "insta" }, async function (error, result) {
        const { public_id, secure_url } = result;
        req.user.public_id = public_id;
        req.user.profilePic = secure_url;

        if (result) {
            await cloudinary.uploader.destroy(mainImgid)

            const updateResult = await findByIdAndUpdate({ model: userModel, condition: _id, data: { public_id, profilePic: secure_url } });
            res.json({ success: true, message: 'User image updated successfully', user: req.user });
        } else {
            res.status(500).json({ success: false, message: 'Image upload failed' });
        }
    });
});
