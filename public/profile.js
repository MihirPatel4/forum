import { format, formatDistanceToNow } from 'https://cdn.skypack.dev/date-fns@4.1.0'

const token = localStorage.getItem('token')
const loginButton = document.getElementById('login-button')
const profileButton = document.getElementById('profile-button')
const editProfileButton = document.getElementById('edit-profile-button')
const editProfileOptions = document.getElementById('edit-profile-options')

const URLparams = new URLSearchParams(window.location.search)
const profileId = URLparams.get('id')

async function isTokenValid() {
    //if user is not logged in
    if (!token) {
        return false
    }

    try {
        const response = await fetch('/auth/verify-token', {
            headers: {'Authorization': token}
        })
        //if user is logged into a different account or has an expired token
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

        //let user edit their profile
        document.getElementById('edit-profile-dropdown').style.display = 'block'
    }
}

//open modals
document.getElementById('edit-bio').addEventListener('click', () => {
    document.getElementById('bio-modal').style.display = 'block'
})
document.getElementById('edit-avatar').addEventListener('click', () => {
    document.getElementById('avatar-modal').style.display = 'block'
})

//close modals
document.getElementById('close-bio-modal').addEventListener('click', () => {
    document.getElementById('bio-modal').style.display = 'none'
})
document.getElementById('close-avatar-modal').addEventListener('click', () => {
    document.getElementById('avatar-modal').style.display = 'none'
})

//submit new bio
document.getElementById('submit-bio').addEventListener('click', async () => {
    const bioInput = document.getElementById('bio-input').value

    if (!bioInput) {return}

    try {
        await fetch(`profiles/${profileId}/bio`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({bio: bioInput})
        })
        window.location.reload()
    }
    catch (err) {
        console.error(err)
    }
})

let threads = []
let posts = []
let isLoading = false
const threadsTab = document.getElementById('threads-tab')
const postsTab = document.getElementById('posts-tab')
const profileThreads = document.getElementById('profile-threads')
const profilePosts = document.getElementById('profile-posts')

async function fetchProfile() {
    isLoading = true

    try {
        const response = await fetch(`profiles/${profileId}`)
        const profileData = await response.json()
        threads = profileData.user.threads
        posts = profileData.user.posts

        if (threads.length == 0) {profileThreads.textContent = 'This user has not created any threads.'}
        if (posts.length == 0) {profilePosts.textContent = 'This user has not created any posts.'}

        isLoading = false
        renderProfile(profileData)
    }
    catch (err) {
        console.error(err)
        document.getElementById('profile-content').textContent = 'Error: Failed to fetch profile data'
    }
}

function renderProfile(profileData) {
    document.title = profileData.user.name
    document.getElementById('avatar').src = profileData.avatar
    document.getElementById('profile-name').textContent = profileData.user.name
    document.getElementById('profile-join-date').textContent = `Join Date: ${format(profileData.user.createdAt, 'MMMM d, yyyy')}`
    document.getElementById('profile-bio').textContent = profileData.bio

    threads.forEach((thread) => {
        let card = document.createElement('div')
        card.className = 'card'

        let cardImgContainer = document.createElement('div')
        cardImgContainer.className = 'card-img-container'
        card.appendChild(cardImgContainer)

        let cardImg = document.createElement('img')
        cardImg.className = 'card-img'
        cardImg.src = 'images/discussion.png'
        cardImgContainer.appendChild(cardImg)

        let cardDetails = document.createElement('div')
        cardDetails.className = 'card-details'
        card.appendChild(cardDetails)

        let threadLink = document.createElement('a')
        threadLink.className = 'thread-link'
        threadLink.href = `thread.html?id=${thread.id}`
        cardDetails.appendChild(threadLink)

        let threadTitle = document.createElement('h3')
        threadTitle.className = 'thread-title'
        threadTitle.textContent = thread.title
        threadLink.appendChild(threadTitle)

        let bottomDetails = document.createElement('span')
        bottomDetails.textContent = `${formatDistanceToNow(thread.createdAt, {addSuffix: true})} • ${thread.posts.length} posts`
        cardDetails.appendChild(bottomDetails)
        
        profileThreads.appendChild(card)
    })

    posts.forEach((post) => {
        let card = document.createElement('div')
        card.className = 'profile-post-card'

        let postTopDetails = document.createElement('div')
        postTopDetails.className = 'post-top-details'
        card.appendChild(postTopDetails)

        let postThreadReference = document.createElement('p')
        postThreadReference.className = 'post-thread-reference'
        postThreadReference.textContent = `${profileData.user.name} posted on `
        postTopDetails.appendChild(postThreadReference)

        let postThreadLink = document.createElement('a')
        postThreadLink.className = 'post-thread-link'
        postThreadLink.textContent = post.thread.title
        postThreadLink.href = `thread.html?id=${post.thread.id}`
        postThreadReference.appendChild(postThreadLink)

        let postDate = document.createElement('p')
        postDate.textContent = `${formatDistanceToNow(post.createdAt, {addSuffix: true})}`
        postTopDetails.appendChild(postDate)

        let postContent = document.createElement('p')
        postContent.className = 'profile-post-main'
        postContent.textContent = post.content
        card.appendChild(postContent)

        profilePosts.appendChild(card)
    })
}

threadsTab.addEventListener('click', () => {
    postsTab.classList.remove('selected-tab')
    threadsTab.classList.add('selected-tab')
    profilePosts.style.display = 'none'
    profileThreads.style.display = 'block'
})

postsTab.addEventListener('click', () => {
    threadsTab.classList.remove('selected-tab')
    postsTab.classList.add('selected-tab')
    profileThreads.style.display = 'none'
    profilePosts.style.display = 'block'

})

authUI()
fetchProfile()