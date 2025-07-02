const loginButton = document.getElementById('login-button')
const profileButton = document.getElementById('profile-button')
const token = localStorage.getItem('token')
const errorText = document.getElementById('error-text')

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
        console.log(err.message)
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
            //take user to home page when logging out
            window.location.replace('index.html')
        })
        //show profile button
        profileButton.style.display = 'inline'
    }
}

authUI()

document.getElementById('create-thread-button').addEventListener('click', async () => {
    const threadTitle = document.getElementById('thread-title-input').value
    const postContent = document.getElementById('post-content-input').value

    //leave the function and display an error if the thread title or post content are not present
    if (!threadTitle) {
        errorText.textContent = 'The thread needs to have a title.'
        errorText.style.display = 'block'
        return
    }
    if (!postContent) {
        errorText.textContent = 'The post needs to have content.'
        errorText.style.display = 'block'
        return
    }

    try {
        const response = await fetch('/threads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({title: threadTitle, content: postContent})
        })

        const data = await response.json()
        window.location.href = `thread.html?id=${data.id}`
    }
    catch (err) {
        console.log(err.message)
    }
})