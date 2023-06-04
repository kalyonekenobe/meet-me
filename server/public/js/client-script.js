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
  const { message, sameSenderBefore, isNewMessageDate } = payload
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
      (!sameSenderBefore || isNewMessageDate) ?
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
              new Date(message.createdAt).toLocaleTimeString('uk', {
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

const handleWindowOnclick = () => {
  const dropdowns = document.querySelectorAll('.dropdown')

  window.onclick = event => {
    if (dropdowns) {
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target) && !dropdown.classList.contains('hidden')) {
          dropdown.classList.toggle('hidden')
        }
      })
    }
  }
}

const handleNavbar = () => {
  const navbar = document.querySelector('.navbar')

  if (navbar) {
    const navbarButtons = navbar.querySelectorAll('.navigation > .link')
    navbarButtons.forEach(button => {
      if (window.location.pathname.trim() !== '/' || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
        if (`${window.location.origin}${window.location.pathname}`.includes(button.href) || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
          button.classList.add('active')
        }
      }
    })

    const profileContainer = navbar.querySelector('.profile-container')
    const profileDropdown = navbar.querySelector('.profile-dropdown')

    if (profileContainer && profileDropdown) {
      profileContainer.onclick = () => {
        const timeout = setTimeout(() => {
          profileDropdown.classList.toggle('hidden')
          clearTimeout(timeout)
        }, 10)
      }
    }
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
  const logoutButton = document.querySelector('.navbar .logout')
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

const handleMessageReceive = socket => {
  socket.on('receive-message', payload => {
    const { chatId, message, token, sameSenderBefore, isNewMessageDate } = payload
    const chatList = document.querySelectorAll('.chat-page-container .event')

    if (chatList) {
      chatList.forEach(chat => {
        const { url } = chat.dataset

        if (url !== chatId)
          return

        const lastMessage = chat.querySelector('.last-message')

        if (lastMessage) {
          lastMessage.innerHTML = `
          <div class="w-100">
              <span class="sender">${message.sender.firstName} ${message.sender.lastName}: </span>
              <span class="message">${message.message}</span>
          </div>
          <time class="time">
            ${
            new Date(message.createdAt).toLocaleTimeString('uk', {
              hour: '2-digit',
              minute: '2-digit'
            })
          }
          </time>
        `
        }
      })
    }

    if (window.location.pathname.includes(chatId)) {
      const chatContainer = document.querySelector('.chat-container .messages')
      const messageClassList = [ 'message-container' ]

      if (token === getCookieByName('X-Access-Token')) {
        messageClassList.push('my-message')
      }

      const messageContainer = createElement('div', createChatMessageHtml(payload), messageClassList)

      if (sameSenderBefore && !isNewMessageDate && chatContainer.firstChild) {
        const lastMessage = chatContainer.querySelector('.message-container')
        const image = lastMessage.querySelector('.profile-image img')
        if (image) {
          image.remove()
        }
      }

      const currentMessageDate = new Date(`${new Date(message.createdAt)} UTC`)
      let dateFormatterOptions = { weekday: 'long', month: 'long', day: 'numeric' }

      if (currentMessageDate.getFullYear() !== new Date().getFullYear()) {
        dateFormatterOptions = { ...dateFormatterOptions, year: 'numeric' }
      }

      const dateFormatter = new Intl.DateTimeFormat('uk', dateFormatterOptions)

      if (isNewMessageDate) {
        const messagesDateDelimiterHtml = `<span>${dateFormatter.format(currentMessageDate)}</span>`
        const messagesDateDelimiter = createElement('div', messagesDateDelimiterHtml, [ 'date-delimiter' ])
        chatContainer.insertBefore(messagesDateDelimiter, chatContainer.firstChild)
      }

      chatContainer.insertBefore(messageContainer, chatContainer.firstChild)
    }
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
        const { sentMessage, sameSenderBefore, isNewMessageDate } = await response.json()
        const payload = {
          message: sentMessage,
          token: getCookieByName('X-Access-Token'),
          sameSenderBefore: sameSenderBefore,
          isNewMessageDate: isNewMessageDate
        }
        socket.emit('send-message', payload, chat);
        sendMessageForm.message.value = ''
      }
    }
  }
}

const handleChatList = () => {
  const chats = document.querySelectorAll('.chat-page-container .event')
  const socket = io(`http://localhost:3000`);
  const chatUrls = []

  if (chats && socket) {
    chats.forEach(chat => {
      const { url } = chat.dataset

      if (url.match(new RegExp('/chats/event/[\d\s]*'))) {
        chatUrls.push(url)
      }

      if (window.location.pathname.includes(url)) {
        chat.classList.add('active')
      }

      chat.onclick = () => {
        redirect(url)
      }
    })

    handleMessageReceive(socket)
    socket.emit('join-chat', chatUrls)

    if (window.location.pathname.match(new RegExp('/chats/event/[\d\s]*'))) {
      handleSendMessageForm(socket, window.location.pathname)
    }
  }
}

const handleJoinRequestSelect = () => {
  const joinRequestSelect = document.querySelector('.join-requests-type')

  if (joinRequestSelect) {
    joinRequestSelect.onchange = event => {
      redirect(`/profile/join-requests/${event.target.value}`)
    }
  }
}

const handleJoinRequestsButtons = () => {
  const joinRequestsButtons = document.querySelectorAll('.join-request-action')

  if (joinRequestsButtons) {
    joinRequestsButtons.forEach(button => {
      button.onclick = async () => {
        const { id, action } = button.dataset

        const response = await fetch(`${window.location.origin}/profile/join-requests/${id}/${action}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 200) {
          const actionsCell = button.closest('.actions')
          const buttonRow = button.closest('.join-request')


          if (actionsCell) {
            actionsCell.innerHTML = `<span class="no-actions">Не передбачено</span>`

            if (buttonRow) {
              const statusCell = buttonRow.querySelector('.status')

              if (statusCell) {

                switch (action) {
                  case 'accept':
                    statusCell.innerHTML = `<span class="accepted">Прийнято</span>`
                    break
                  case 'reject':
                    statusCell.innerHTML = `<span class="rejected">Відхилено</span>`
                    break
                  default:
                    statusCell.innerHTML = `<span class="pending">На розгляді</span>`
                    break
                }
              }
            }
          }
        }
      }
    })
  }
}

const handleAppendAdditionalImageInput = (input, container) => {
  if (input && container) {
    input.onchange = () => {
      input.onchange = undefined
      const html =`<input type="file" class="w-100" name="additionalImages">`
      const newInput = createElement('label', html, [ 'form-item', 'col-12', 'col-sm-6', 'additional-image' ])
      container.insertBefore(newInput, container.firstChild)
      handleAppendAdditionalImageInput(newInput, container)
    }
  }
}

const handleAdditionalImagesContainer = () => {
  const lastAdditionalImageInput = document.querySelector('#additional-images .additional-image:last-child')

  if (lastAdditionalImageInput) {
    const lastAdditionalImageInputContainer = lastAdditionalImageInput.closest('#additional-images')
    if (lastAdditionalImageInputContainer) {
      handleAppendAdditionalImageInput(lastAdditionalImageInput, lastAdditionalImageInputContainer)
    }
  }
}

const handleCreateEventForm = () => {
  const createEventForm = document.querySelector('.create-event-form')

  if (createEventForm) {
    createEventForm.onsubmit = async event => {
      event.preventDefault()
      let formData = new FormData(createEventForm)

      if (formData.get('image').size === 0 || formData.get('image').name.trim() === '') {
        formData.set('image', undefined)
      }

      formData.delete('additionalImages')
      formData.delete('city')
      formData.delete('country')
      formData.set('location', `${createEventForm.country.value}, ${createEventForm.city.value}`)

      if (Array.isArray(createEventForm.additionalImages)) {
          createEventForm.additionalImages.forEach(image => {
            const file = image.files[0]

            if (file && (file.size > 0 || file.name.trim() !== '')){
              formData.append('additionalImages', file)
            }
          })
      } else {
        const file = createEventForm.additionalImages.files[0]

        if (file && (file.size > 0 || file.name.trim() !== '')){
          formData.append('additionalImages', file)
        }
      }

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData
      })

      if (response.status === 200) {
        redirect('/events')
      } else {
        const { error } = await response.json()
        const errorsContainer = createEventForm.querySelector('.errors')
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    createEventForm.onchange = () => {
      const errorsContainer = createEventForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    handleWindowOnclick()
    handleNavbar()
    handleSignInForm()
    handleSignUpForm()
    handleLogout()
    handleChatList()
    handleJoinRequestSelect()
    handleJoinRequestsButtons()
    handleAdditionalImagesContainer()
    handleCreateEventForm()
  }
}