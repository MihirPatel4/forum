let isRegistration = false
let isAuthenticating = false

errorText = document.getElementById('error-text')

document.getElementById('signup-link').addEventListener('click', toggleRegistration)
document.getElementById('login').addEventListener('click', authenticate)

function toggleRegistration() {
    isRegistration = !isRegistration
    //change to sign up options
    document.getElementById('login-header').textContent = isRegistration ? 'Register an account:' : 'Enter your email and password:'
    document.getElementById('display-name-label').style.display = isRegistration ? 'block' : 'none'
    document.getElementById('display-name-input').style.display = isRegistration ? 'block' : 'none'
    document.getElementById('login').textContent = isRegistration ? 'Sign up' : 'Log in'
    document.getElementById('signup-link').textContent = isRegistration ? 'Already have an account? Log in' : 'No registered account? Sign up'
}

async function authenticate() {
    const emailVal = document.getElementById('email-input').value
    const nameVal = document.getElementById('display-name-input').value
    const passVal = document.getElementById('pass-input').value

    //prevent authentication attempt if input values are not valid
    if (isAuthenticating || !emailVal || !passVal || passVal.length < 8 || !emailVal.includes('@')) {return}

    isAuthenticating = true
    
    try {
        let data
        if (isRegistration) {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: emailVal, name: nameVal, password: passVal})
            })
            data = await response.json()
        }
        else {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: emailVal, password: passVal})
            })
            data = await response.json()
        }

        if (data.token) {
            token = data.token
            localStorage.setItem('token', token)
            window.location.href = '/'
        }
        else {
            throw Error('Authentication failed')
        }
    }
    catch (err) {
        console.log(err.message)
        errorText.textContent = err.message
        errorText.style.display = 'block'
    }
    finally {
        isAuthenticating = false
    }
}