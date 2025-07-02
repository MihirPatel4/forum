import { format, formatDistanceToNow } from 'https://cdn.skypack.dev/date-fns@4.1.0'

const token = localStorage.getItem('token')

let isLoading = false
let posts = []

const loginButton = document.getElementById('login-button')
const profileButton = document.getElementById('profile-button')
const errorText = document.getElementById('error-text')

//get the thread id
const URLparams = new URLSearchParams(window.location.search)
const threadId = URLparams.get('id')

async function isTokenValid() {
    if (!token) {
        return false
    }

    try {
        const response = await fetch('/auth/verify-token', {
            headers: {'Authorization': token}
        })
        if (!response.ok) {
            return false
        }
        //let user access their profile
        const {userId} = await response.json()
        profileButton.href = `profile.html?id=${userId}`
        return true
    }
    catch (err) {
        console.error(err)
        return false
    }
}

async function authUI() {
    const valid = await isTokenValid()
    if (valid) {
        //let user log out if they are logged in
        loginButton.textContent = 'Log out'
        loginButton.href = '#'
        loginButton.addEventListener('click', () => {
            localStorage.removeItem('token')
            window.location.reload()
        })
        profileButton.style.display = 'inline'
        //let user add a post to the thread if they are logged in
        document.getElementById('add-post-container').style.display = 'block';
    }
}

async function fetchThread() {
    isLoading = true

    const response = await fetch(`threads/${threadId}`)
    const threadData = await response.json()
    posts = threadData.posts
    isLoading = false

    renderThread(threadData)
}

function renderThread(threadData) {
    document.getElementById('thread-page-title').textContent = threadData.title
    document.title = threadData.title

    posts.forEach((post) => {
        let postDiv = document.createElement('div')
        postDiv.className = 'post'
        document.getElementById('thread-container').appendChild(postDiv)

        let postDetails = document.createElement('div')
        postDetails.className = 'post-details'
        postDiv.appendChild(postDetails)

        let postNumber = document.createElement('span')
        postNumber.textContent = `#${post.postNumber}`
        postDetails.appendChild(postNumber)

        let postTime = document.createElement('span')
        postTime.textContent = formatDistanceToNow(post.createdAt, {addSuffix: true})
        postDetails.appendChild(postTime)

        let postMain = document.createElement('div')
        postMain.className = 'post-main'
        postDiv.appendChild(postMain)

        let authorDetails = document.createElement('div')
        authorDetails.className = 'author-details'
        postMain.appendChild(authorDetails)

        let avatarContainer = document.createElement('div')
        avatarContainer.className = 'post-avatar-container'
        authorDetails.appendChild(avatarContainer)

        let avatar = document.createElement('img')
        avatar.className = 'post-avatar'
        avatar.src = post.author.profile.avatar
        avatarContainer.appendChild(avatar)

        let authorName = document.createElement('h3')
        authorName.className = 'post-author-name'
        authorName.textContent = post.author.name
        authorDetails.appendChild(authorName)

        let joinDate = document.createElement('p')
        joinDate.className = 'author-join-date'
        joinDate.textContent = `Join Date: ${format(post.author.createdAt, 'MMMM d, yyyy')}`
        authorDetails.appendChild(joinDate)

        let postContent = document.createElement('div')
        postContent.className = 'post-content'
        postContent.textContent = post.content
        postMain.appendChild(postContent)
    })

}

authUI()
fetchThread()

document.getElementById('add-post-button').addEventListener('click', async () => {
    const postContent = document.getElementById('post-content-input').value

    //leave the function if post content not present
    if (!postContent) {
        errorText.textContent = 'The post needs to have content.'
        errorText.style.display = 'block'
        return
    }

    try {
        const response = await fetch(`threads/${threadId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({content: postContent})
        })
        document.getElementById('post-content-input').value = ''
        window.location.reload()
    }
    catch (err) {
        errorText.textContent = 'Error adding post to thread'
        errorText.style.display = 'block'
        console.error(err)
    }
})