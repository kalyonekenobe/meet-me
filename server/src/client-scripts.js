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
    console.log(response)
  }

  const logoutTestLink = document.getElementById('logout-test-link')
  logoutTestLink.onclick = async event => {
    const response = await fetch('http://localhost:8000/logout', {
      method: "POST"
    })
    console.log(response)
  }
}