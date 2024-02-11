import userModel from '../../../../DB/model/user.model.js'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../../../services/asyncHandler.js';
import { findById, findByIdAndDelete, findOneAndUpdate, findOne, find, findByIdAndUpdate, create, findOneAndDelete } from '../../../../DB/DBMethods.js';
import cloudinary from '../../../services/cloudinary.js'
import { populate } from 'dotenv';
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
        path: "saved",
    }
];
export const newCollection = asyncHandler(async (req, res, next) => {

    let { collectionName } = req.body
    let newCollection = { collectionName }
    let addCollection = await findByIdAndUpdate({
        model: userModel, condition: req.user._id, data: {
            $addToSet: { collections: newCollection },
        },
    })
    if (addCollection) {
        res.status(200).json({
            success: true,
            message: 'collection added',
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'added collection failed',
        });
    }
})

export const savePost = asyncHandler(async (req, res, next) => {
    let { postId, ref } = req.body;

let ifSaved = req.user.saved.filter(saved => saved._id == postId);
    if (ifSaved.length!=0) {
        const savedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { $pull: { saved: postId } }, options: { new: true } })
        if (savedPost) {
            res.status(200).json({
                success: true,
                message: 'Post UnSaved successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to UnSaved post',
            });
        }
    } else {
        const savedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { $addToSet: { saved: postId } }, options: { new: true } })
        if (savedPost) {
            res.status(200).json({
                success: true,
                message: 'Post saved successfully',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Failed to save post',
            });
        }
    }
});
