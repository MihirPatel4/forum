import { formatDistanceToNow } from 'https://cdn.skypack.dev/date-fns@4.1.0'

let threads = []
const loginButton = document.getElementById('login-button')
const profileButton = document.getElementById('profile-button')

async function isTokenValid() {
    const token = localStorage.getItem('token')
    if (!token) {
        console.log('No token provided')
        return false
    }

    try {
        const response = await fetch('/auth/verify-token', {
            headers: {'Authorization': token}
        })
        if (!response.ok) {
            console.log('Invalid token')
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
        //let user create a post if they are logged in
        document.getElementById('thread-action').href = 'thread-creation.html'

        //let user log out if they are logged in
        loginButton.textContent = 'Log out'
        loginButton.href = '#'
        loginButton.addEventListener('click', () => {
            localStorage.removeItem('token')
            window.location.reload()
        })
        profileButton.style.display = 'inline'
    }
}

async function fetchThreads() {
    const res = await fetch('/threads')
    const threadsData = await res.json()
    threads = threadsData
    renderThreads()
}

function renderThreads() {
    //create a card element for each post in the array
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
        let timeAgo = formatDistanceToNow(thread.createdAt, {addSuffix: true}) //convert Date object to time ago format
        bottomDetails.textContent = `${thread.author.name} • ${timeAgo} • ${thread.posts.length} posts`
        cardDetails.appendChild(bottomDetails)
        
        document.getElementById('card-container').appendChild(card)
    })
}

authUI()
fetchThreads()