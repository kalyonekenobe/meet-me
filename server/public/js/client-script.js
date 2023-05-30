const redirect = path => {
  const url = new URL(path, location.origin)
  location.replace(url)
}

const createElement = (tag, content, classList = [], id = undefined) => {
  const element = document.createElement(tag)
  classList.forEach(classItem => element.classList.add(classItem))
  element.innerHTML = content
  return element
}

const handleNavbar = () => {
  const navbar = document.querySelector('.navbar')
  if (navbar) {
    const navbarButtons = navbar.querySelectorAll('.navigation > .link')
    navbarButtons.forEach(button => {
      if (button.href.includes(`${window.location.origin}${window.location.pathname}`)) {
        if (window.location.pathname.trim() !== '/' || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
          button.classList.add('active')
        }
      }
    })
  }
}

const handleSignInForm = () => {
  const signInForm = document.querySelector('.sign-in-form')
  if (signInForm) {
    signInForm.onsubmit = async event => {
      event.preventDefault()
      const { email, password, rememberMe } = signInForm
      const response = await fetch('http://localhost:8000/login', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.value, password: password.value, rememberMe: rememberMe.value })
      })

      if (response.status === 200) {
        redirect('/')
      } else {
        const { error } = await response.json()
        const errorsContainer = signInForm.querySelector('.errors')
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    signInForm.onchange = event => {
      const errorsContainer = signInForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

const handleSignUpForm = () => {
  const signUpForm = document.querySelector('.sign-up-form')
  if (signUpForm) {
    signUpForm.onsubmit = async event => {
      event.preventDefault()
      const { email, password, firstName, lastName, dateOfBirth } = signUpForm
      const response = await fetch('http://localhost:8000/register', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
          firstName: firstName.value,
          lastName: lastName.value,
          dateOfBirth: dateOfBirth.value
        })
      })

      if (response.status === 200) {
        redirect('/sign-in')
      } else {
        const { error } = await response.json()
        const errorsContainer = signUpForm.querySelector('.errors')
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    signUpForm.onchange = event => {
      const errorsContainer = signUpForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

const handleLogout = () => {
  const logoutButton = document.querySelector('.logout-button')
  if (logoutButton) {
    logoutButton.onclick = async event => {
      const response = await fetch('http://localhost:8000/logout', {
        method: "POST",
      })
      if (response.status === 200) {
        redirect('/sign-in')
      }
    }
  }
}

document.onreadystatechange = () => {
  handleNavbar()
  handleSignInForm()
  handleSignUpForm()
  handleLogout()
}