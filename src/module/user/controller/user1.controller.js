import userModel from '../../../../DB/model/user.model.js'
import postModel from '../../../../DB/model/post.model.js'


import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../../../services/asyncHandler.js';
import { findById, findByIdAndDelete, findOneAndUpdate, findOne, find, findByIdAndUpdate, create, findOneAndDelete } from '../../../../DB/DBMethods.js';
import cloudinary from '../../../services/cloudinary.js'
import { populate } from 'dotenv';
import reelModel from '../../../../DB/model/reel.model.js';
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
    if (ref == 'Post') {
        let ifSaved = req.user.savedPosts.filter(saved => saved._id == postId);
        if (ifSaved.length != 0) {
            req.user.savedPosts = req.user.savedPosts.filter(saved => saved._id != postId);
            const unsavedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { savedPosts: req.user.savedPosts }, options: { new: true } })
            if (unsavedPost) {
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
            const savedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { $addToSet: { savedPosts: postId } }, options: { new: true } })
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
    } else {
        if (ref == 'Reel') {
            let ifSaved = req.user.savedReels.filter(saved => saved._id == postId);
            if (ifSaved.length != 0) {
                req.user.savedReels = req.user.savedReels.filter(saved => saved._id != postId);
                const unsavedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { savedReels: req.user.savedReels }, options: { new: true } })
                if (unsavedPost) {
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
                const savedPost = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { $addToSet: { savedReels: postId } }, options: { new: true } })
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
        }
    }
});





export const addToCollection = asyncHandler(async (req, res, next) => {

    // Extract user ID from request
    let userId = req.user._id;

    // Find user object in database
    let user = await findById({ model: userModel, condition: userId });

    // Filter the user's collections to find the one with the provided collection ID
    let theCollection = user.collections.find(item => item._id == req.body.collectionId);

    // Check if the collection exists
    if (!theCollection) {
        return res.status(404).json({ message: 'Collection not found' });
    }

    // Iterate over each selected item and add it to the 'saved' array of the collection
    for (let i = 0; i < req.body.selected.length; i++) {
        const element = req.body.selected[i];
        theCollection.saved.push(element);
    }
    const savedUpdate = await findByIdAndUpdate({ model: userModel, condition: req.user._id, data: { collections: user.collections }, options: { new: true } })

    // Save the updated user object back to the database

    // Send a success response
    res.status(200).json({ success: true, message: 'Items added to collection successfully', collection: savedUpdate.collections });

});





export const getPostsBasedOnSocialNetwork = asyncHandler(async (req, res, next) => {

    const postPop = [
        {
            path: "createdBy",
            populate: [
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
            ]
        },
        {
            path: "comments",
            populate: [
                {
                    path: "userId",
                },
            ]
        }
    ];






    const user = await findById({ model: userModel, condition: req.user._id })
    const following = user.following;
    const followersOfFollowers = await userModel.find({ following: req.user._id }, '_id');
    const followersOfFollowersIds = followersOfFollowers.map(user => user._id);
    const combinedUserIdsSet = [...following, ...followersOfFollowersIds];
    const combinedUserIds = [...combinedUserIdsSet];
    combinedUserIds.push(req.user._id)



    const posts = await find({
        model: postModel,
        condition: { createdBy: { $in: combinedUserIds } },
        populate: [...postPop]
    });
    const reels = await find({
        model: reelModel,
        condition: { createdBy: { $in: combinedUserIds } },
        populate: [...postPop]
    });

    const combinedPosts = [...reels, ...posts];
    const allPosts = [...combinedPosts];


    allPosts.sort((a, b) => b.createdAt - a.createdAt);
    res.status(200).json({
        allPosts
    });
});

export const allNotificationSeen = asyncHandler(async (req, res, next) => {
    let user = req.user;

    // Iterate through each notification and mark it as seen
    user.notifications.forEach(notification => {
        notification.seen = true;
    });

    // Save the user object to persist the changes
    await user.save();
    res.status(200).json({
        success: true
    });
});
export const bio = asyncHandler(async (req, res, next) => {
    let user = req.user;

    // Iterate through each notification and mark it as seen
    user.bio = req.body.bio

    // Save the user object to persist the changes
    await user.save();
    res.status(200).json({
        success: true
    });
});
export const getSaved = asyncHandler(async (req, res, next) => {
    let user = req.user;
const savedPosts = user.savedPosts
const savedReels = user.savedReels
const combinedPosts = [...savedPosts, ...savedReels];
const saved = [...combinedPosts];


saved.sort((a, b) => b.createdAt - a.createdAt);
res.status(200).json({
    saved
});
});