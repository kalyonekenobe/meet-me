const redirect = path => {
  const url = new URL(path, location.origin)
  location.replace(url)
}

const getCookieByName = name => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match)
    return match[2];
}

const createElement = (tag, content, classList = [], id) => {
  const element = document.createElement(tag)

  if (id) {
    element.id = id
  }

  classList.forEach(classItem => element.classList.add(classItem))
  element.innerHTML = content
  return element
}

const createChatMessageHtml = payload => {
  const { message, sameSenderBefore } = payload
  let profileImagePath;
  if (message.sender.profilePicture !== 'default-user-image.jpg')
    profileImagePath = `/uploads/images/users/${message.sender.profilePicture}`
  else
    profileImagePath = `/images/${message.sender.profilePicture}`
  return `
    <div class="profile-image">
      <a href="/users/${message.sender._id}">
        <img src="${profileImagePath}" alt="User profile photo">
      </a>
    </div>
    <div class="message">
    ${
      !sameSenderBefore ?
        `
        <header>
          <span class="sender">
            ${message.sender.firstName} ${message.sender.lastName}
          </span>
        </header>
        ` : 
        ``
      } 
      <div class="content">
        ${message.message}
        <span class="time-space"></span>
      </div>
      <footer>
        <div class="time">
          <time>
            ${
              new Date(message.createdAt).toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          </time>
        </div>
      </footer>
    </div>
  `
}

const handleNavbar = () => {
  const navbar = document.querySelector('.navbar')
  if (navbar) {
    document.body.style.paddingTop = `${navbar.clientHeight}px`
    const navbarButtons = navbar.querySelectorAll('.navigation > .link')
    navbarButtons.forEach(button => {
      if (window.location.pathname.trim() !== '/' || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
        if (`${window.location.origin}${window.location.pathname}`.includes(button.href)) {
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

const connectToChat = (socket, chat) => {
  socket.emit('join-chat', chat);
}

const handleMessageReceive = socket => {
  socket.on('receive-message', payload => {
    const { message, token, sameSenderBefore } = payload
    const chatContainer = document.querySelector('.chat-container .messages')
    const messageClassList = [ 'message-container' ]
    if (token === getCookieByName('X-Access-Token')) {
      messageClassList.push('my-message')
    }
    const messageContainer = createElement('div', createChatMessageHtml({ message, sameSenderBefore}), messageClassList)
    if (sameSenderBefore && chatContainer.firstChild) {
      const lastMessage = chatContainer.querySelector('.message-container')
      const image = lastMessage.querySelector('.profile-image img')
      if (image) {
        image.remove()
      }
    }
    chatContainer.insertBefore(messageContainer, chatContainer.firstChild)
  })
}

const handleSendMessageForm = (socket, chat) => {
  const sendMessageForm = document.getElementById('send-message-form');
  if (sendMessageForm) {
    sendMessageForm.onsubmit = async event => {
      event.preventDefault()
      const message = sendMessageForm.message.value;
      const response = await fetch(`${window.location}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message
        })
      })

      if (response.status === 200) {
        const { sentMessage, sameSenderBefore } = await response.json()
        const payload = {
          message: sentMessage,
          token: getCookieByName('X-Access-Token'),
          sameSenderBefore: sameSenderBefore
        }
        socket.emit('send-message', payload, chat);
        sendMessageForm.message.value = ''
      }
    }
  }
}

const handleChat = () => {
  if (window.location.pathname.match(new RegExp('chats/event/[\d\s]*'))) {
    const socket = io(`http://localhost:3000`);
    const chat = window.location.pathname;

    if (socket && chat) {
      connectToChat(socket, chat)
      handleMessageReceive(socket)
      handleSendMessageForm(socket, chat)
    }
  }
}

const handleChatList = () => {
  const chats = document.querySelectorAll('.chat-page-container .event')
  if (chats) {
    chats.forEach(chat => {
      chat.onclick = () => {
        const { url } = chat.dataset
        redirect(url)
      }
    })
  }
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    handleNavbar()
    handleSignInForm()
    handleSignUpForm()
    handleLogout()
    handleChat()
    handleChatList()
  }
}