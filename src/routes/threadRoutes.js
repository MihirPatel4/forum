import express from 'express'
import prisma from '../prismaClient.js'
import authMiddleware from '../authMiddleware.js'

const router = express.Router()

//get all threads
router.get('/', async (req, res) => {
    const threads = await prisma.thread.findMany({
        include: {
            posts: true,
            author: {
                select: {id: true, name: true, role: true}
            }
        },
        orderBy: {id: 'desc'}
    })
    res.json(threads)
})

//create a thread with the first post
router.post('/', authMiddleware, async (req, res) => {
    const {title, content} = req.body

    //create the first post after the thread to get the thread id
    try {
        const newThread = await prisma.$transaction(async (tx) => {
            const thread = await prisma.thread.create({
                data: {
                    title,
                    author: {connect: {id: req.userId}}
                },
                include: {
                    posts: true
                }
            })
            await tx.post.create({
                data: {
                    thread: {connect: {id: thread.id}},
                    postNumber: 1,
                    content,
                    author: {connect: {id: req.userId}}
                }
            })
            return thread
        })
        res.status(200).json(newThread)
    }
    catch (err) {
        console.error(err)
        res.status(500).json({message: 'Failed to create thread'})
    }
})

//delete a thread
router.delete('/:id', authMiddleware, async (req, res) => {
    const {id} = req.params

    try {
        await prisma.thread.delete({
            where: {
                id: parseInt(id),
                authorId: req.authorId
            }
        })
        res.status(200).send({message: 'Thread deleted'})
    }
    catch (err) {
        console.error(err)
        res.status(500).send({message: 'Failed to delete thread'})
    }
})

//post in a thread
router.post('/:id', authMiddleware, async (req, res) => {
    try{
        //get the latest post to set the post number in the thread
        const latestPost = await prisma.post.findFirst({
            where: {threadId: parseInt(req.params.id)},
            orderBy: {postNumber: 'desc'}
        })

        const {content} = req.body
        const postNumber = (latestPost?.postNumber ?? 1) + 1

        const post = await prisma.post.create({
            data: {
                content,
                thread: {connect: {id: parseInt(req.params.id)}},
                author: {connect: {id: req.userId}},
                postNumber
            }
        })
        res.status(200).json(post)
    }
    catch (err) {
        console.error(err)
        res.status(500).send({message: 'Failed to add post'})
    }
})

//get one thread
router.get('/:id', async (req, res) => {
    const {id} = req.params

    try {
        const thread = await prisma.thread.findUnique({
            where: {id: parseInt(id)},
            include: {
                posts: {
                    include: {
                        author: {
                            select: {id: true, name: true, profile: true, role: true, createdAt: true}
                        }       
                    }
                },
                author: {
                    select: {id: true, name: true, role: true}
                }
            }
        })
        res.status(200).json(thread)
    }
    catch (err) {
        console.error(err)
        res.status(404).send({message: `Thread ID ${id} not found`})
    }
})

//get latest thread
router.get('/latest', async (req, res) => {
    const latestThread = await prisma.thread.findFirst({
        orderBy: {id: 'desc'}
    })
    res.json(latestThread)
})

//edit a post
router.put('/:threadId/:postId', authMiddleware, async (req, res) => {
    const {threadId, postId} = req.params
    const {content} = req.body

    try {
        await prisma.post.update({
            where: {
                threadId: parseInt(threadId),
                id: parseInt(postId)
            },
            data: {
                content,
                lastModified: new Date()
            }
        })
        res.status(200).send({message: 'Post edited successfully'})
    }
    catch (err) {
        console.error(err)
        res.status(500).send({message: 'Failed to edit post'})
    }
})

//get one post
router.get('/:threadId/:postId', async (req, res) => {
    const {threadId, postId} = req.params

    try {
        const post = await prisma.post.findUnique({
            where: {
                threadId: parseInt(threadId),
                id: parseInt(postId)
            },
            include: {
                author: {
                    select: {id: true, name: true, profile: true, role: true, createdAt: true}
                }       
            }
        })
        res.status(200).json(post)
    }
    catch (err) {
        console.error(err)
        res.status(404).send({message: 'Post not found'})
    }
})

export default router