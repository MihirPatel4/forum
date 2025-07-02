import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'
import authMiddleware from '../authMiddleware.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    const {email, name, password} = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        //create the user
        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})

        //create the profile
        const profile = await prisma.profile.create({
            data: {
                user: {connect: {id: user.id}},
                avatar: 'images/avatar_default.png',
                bio: ''
            }
        })

        res.status(200).json({token})
    }
    catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

router.post('/login', async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!email) {return res.status(404).send({message: 'User with this email address not found'})}

        //compare hashed password
        const passIsValid = bcrypt.compareSync(password, user.password)
        if (!passIsValid) {return res.status(401).send({message: 'Invalid password'})}

        //send token when email match is found and password is correct
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '24h'})
        res.json({token})
    }
    catch (err) {
        console.error(err)
        res.sendStatus(500)
    }
})

//verify the token and send the user id
router.get('/verify-token', authMiddleware, (req, res) => {
    res.status(200).send({userId: req.userId})
})

export default router