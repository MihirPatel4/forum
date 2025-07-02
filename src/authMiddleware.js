import jwt from 'jsonwebtoken'

export default function authMiddleware(req, res, next) {
    const token = req.headers['authorization']
    if (!token) {return res.status(401).send({message: 'No token provided'})}

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {return res.status(401).send({message: 'Invalid token'})}
        req.userId = user.id
        next()
    })
}