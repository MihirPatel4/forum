import express from 'express'
import prisma from '../prismaClient.js'
import authMiddleware from '../authMiddleware.js'

const router = express.Router()

//get a profile
router.get('/:id', async (req, res) => {
    const {id} = req.params

    try {
        const profile = await prisma.profile.findUnique({
            where: {id: parseInt(id)},
            include: {
                user: 
                    {select: {
                        name: true,
                        role: true,
                        createdAt: true,
                        threads: {
                            orderBy: {id: 'desc'},
                            include: {posts: true}
                        },
                        posts: {
                            orderBy: {id: 'desc'},
                            include: {thread: true}
                        }
                    }
                }
            }
        })
        res.status(200).json(profile)
    }
    catch (err) {
        console.error(err)
        res.status(404).send({message: 'Profile not found'})
    }
})

//edit a bio
router.put('/:id/bio', authMiddleware, async (req, res) => {
    const {id} = req.params
    const {bio} = req.body

    try {
        await prisma.profile.update({
            where: {id: parseInt(id)},
            data: {bio}
        })
        res.status(200).send({message: 'Edited bio successfully'})
    }
    catch (err) {
        console.error(err)
        res.status(500).send({message: 'Failed to edit bio'})
    }
})

//edit an avatar
router.put('/:id/avatar', authMiddleware, async (req, res) => {
    const {id} = req.params
    const {avatar} = req.body

    try {
        await prisma.profile.update({
            where: {id: parseInt(id)},
            data: {avatar}
        })
        res.status(200).send({message: 'Edited avatar successfully'})
    }
    catch (err) {
        console.error(err)
        res.status(500).send({message: 'Failed to edit avatar'})
    }
})

export default router