import { format, formatDistanceToNow } from 'https://cdn.skypack.dev/date-fns@4.1.0'

const token = localStorage.getItem('token')
let responseId

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
        responseId = userId
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

        //let user access their profile
        profileButton.href = `profile.html?id=${responseId}`
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
        const postDiv = document.createElement('div')
        postDiv.className = 'post'

        postDiv.innerHTML = `
            <div class="post">
                <div class="post-details">
                    <span>#${post.postNumber}</span>
                    <span>${formatDistanceToNow(post.createdAt, {addSuffix: true})}</span>
                </div>
                <div class="post-main">
                    <div class="author-details">
                        <div class="post-avatar-container">
                            <img class="post-avatar" src=${post.author.profile.avatar}>
                        </div>
                        <a class="post-author-name" href="profile.html?id=${post.author.id}">${post.author.name}</a>
                        <p class="author-join-date">Join Date: ${format(post.author.createdAt, 'MMMM d, yyyy')}</p>
                    </div>
                    <div class="post-content" id="post-${post.postNumber}-content"></div>
                </div>
            </div>`

        let postContent = postDiv.querySelector('.post-content')
        postContent.textContent = post.content

        //show last modified text if post was edited
        let lastModified = ''
        if (post.lastModified) {lastModified = `Last modified ${formatDistanceToNow(post.lastModified, {addSuffix: true})}`}

        postContent.innerHTML += `
        <div class="post-bottom-bar" id="post-${post.postNumber}-bottom-bar">
            <span class="last-modified">${lastModified}</span>
        </div>`

        //let user edit or delete post if it is their post
        if (post.author.id == responseId) {
            postContent.querySelector('.post-bottom-bar').innerHTML += `
                <div class="post-options-dropdown">
                    <button class="post-options" id="post-${post.postNumber}-options">...</button>
                    <div class="post-options-menu" id="post-${post.postNumber}-options-menu">
                        <a class="edit-post" id="edit-post-${post.id}" href="#">Edit</a>
                        <a class="delete-post" id="delete-post-${post.id}" href="#">Delete</a>
                    </div>
                </div>`
        }

        document.getElementById('thread-container').appendChild(postDiv);
    })

    addButtonFunctionality()
}

authUI()
fetchThread()

function addButtonFunctionality() {
    const optionsButtons = document.getElementsByClassName('post-options')
    for (let button of optionsButtons) {
        button.addEventListener('click', (event) => {
            event.stopPropagation()
            const postNumber = event.currentTarget.id.split('-')[1]
            document.getElementById(`post-${postNumber}-options-menu`).style.display = 'block'
        })
    }

    const editPostButtons = document.getElementsByClassName('edit-post')
    for (let button of editPostButtons) {
        button.addEventListener('click', (event) => {
            event.preventDefault()
            const postId = event.currentTarget.id.split('edit-post-')[1]
            editModal(parseInt(postId))
        })
    }

    const deletePostButtons = document.getElementsByClassName('delete-post')
    for (let button of deletePostButtons) {
        button.addEventListener('click', (event) => {
            event.preventDefault()
            const postId = event.currentTarget.id.split('delete-post-')[1]
            deleteModal(parseInt(postId))
        })
    }
}

//clicking anywhere closes dropdown menu
document.addEventListener('click', () => {
    const optionsMenus = document.getElementsByClassName('post-options-menu')
    for (let menu of optionsMenus) {
        menu.style.display = 'none'
    }
})

//open modals
async function editModal(postId) {
    //get the post content of the post being edited
    const response = await fetch(`threads/${threadId}/${postId}`)
    const oldPost = await response.json()
    const {content} = oldPost

    document.getElementById('edit-post-input').textContent = content
    document.getElementById('edit-post-modal').style.display = 'block'
    document.getElementById('submit-edit').addEventListener('click', () => {editPost(postId)})
}
function deleteModal(postId) {
    document.getElementById('delete-post-modal').style.display = 'block'
    document.getElementById('submit-delete').addEventListener('click', deletePost(postId))
}

//close modals
document.getElementById('close-edit-modal').addEventListener('click', () => {
    document.getElementById('edit-post-modal').style.display = 'none'
})
document.getElementById('close-delete-modal').addEventListener('click', () => {
    document.getElementById('delete-post-modal').style.display = 'none'
})

async function editPost(postId) {
    const newContent = document.getElementById('edit-post-input').value

    if (!newContent) {return}

    try {
        await fetch(`threads/${threadId}/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({content: newContent})
        })
        window.location.reload()
    }
    catch (err) {
        console.error(err)
    }
}

async function deletePost(postId) {
    //TODO: DELETE FUNCTIONALITY
}

document.getElementById('add-post-button').addEventListener('click', async () => {
    const postContent = document.getElementById('post-content-input').value

    if (!postContent) {
        errorText.textContent = 'Cannot submit blank post'
        errorText.style.display = 'block'
        return
    }

    try {
        await fetch(`threads/${threadId}`, {
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