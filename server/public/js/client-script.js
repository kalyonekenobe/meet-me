const redirect = path => {
  const url = new URL(path, location.origin)
  location.replace(url)
}

document.onreadystatechange = () => {
  const loginTestLink = document.getElementById('login-test-link')
  loginTestLink.onclick = async event => {
    const response = await fetch('http://localhost:8000/login', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "admin@gmail.com",
        password: "password"
      })
    })
    if (response.status === 200) {
      redirect('/')
    } else {
      console.log(response.body)
    }
  }

  const logoutTestLink = document.getElementById('logout-test-link')
  logoutTestLink.onclick = async event => {
    const response = await fetch('http://localhost:8000/logout', {
      method: "POST",
    })
    if (response.status === 200) {
      redirect('/sign-in')
    } else {
      console.log(response.body)
    }
  }
}