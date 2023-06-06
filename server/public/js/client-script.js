const redirect = path => {
  const url = new URL(path, location.origin)
  location.replace(url)
}

const isIterable = object => object != null && typeof object[Symbol.iterator] === 'function'

const fetchFile = async (filepath, filename) => {
  const image = await fetch(filepath)
  const blob = await image.blob()
  return new File([blob], filename, blob)
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
        body: JSON.stringify({ email: email.value, password: password.value, rememberMe: rememberMe.checked })
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


    if (chatUrls.length > 0) {
      handleMessageReceive(socket)
      socket.emit('join-chat', chatUrls)
    }

    if (window.location.pathname.match(new RegExp('/chats/event/[\d\s]*'))) {
      handleSendMessageForm(socket, window.location.pathname)
    }
  }
}
const handleEventsPage = async () => {
  const pathname = window.location.pathname

  let eventsList;
  if (pathname === '/' || pathname === '/events') {
    const response = await fetch(`${window.location.origin}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const { events } = await response.json()
      eventsList = structuredClone(events);

      if (events.length === 0)
        return;

      let currentEvent = deleteAndReturnRandomElement(eventsList);
      showEventBlock(currentEvent);

      const eventButtons = document.querySelectorAll('.event-button');
      eventButtons.forEach(button => {
        button.onclick = async () => {
          console.log(button)
          if (button.getAttribute('id') === 'join-request') {
            const response = await fetch(`/events/join/${currentEvent._id}`, {
              method: 'POST',
            })

            if(response.status === 200)
              alert('Запит на приєднання надіслано успішно!');
            else
              alert('ой,помилка');

            if(eventsList.length === 0)
              eventsList = events.filter(event => event._id.toString() !== currentEvent._id.toString());

            currentEvent = deleteAndReturnRandomElement(eventsList);
            showEventBlock(currentEvent);
          }
        }
      });
    }
  }
}
const showEventBlock = (event) =>{
  const title = document.getElementById('title');
  const location = document.getElementById('location');
  const eventDay = document.getElementById('event-day');
  const eventHours = document.getElementById('event-hours');
  const membersNumber = document.getElementById('members-number');
  const description = document.getElementById('description');
  const image = document.getElementById('event-img');

  image.setAttribute('src',`/images/${event.image}`)
  title.innerText = event.title;

  const date = new Date(event.date);

  const monthAndDayOptions = {
    month: 'long',
    day: 'numeric',
  };

  const hourAndMinuteOptions = {
    hour: 'numeric',
    minute: 'numeric',
  };

  eventDay.innerText = date.toLocaleString('uk', monthAndDayOptions);
  eventHours.innerText = date.toLocaleString('uk', hourAndMinuteOptions);
  membersNumber.innerText = event.participants.length.toString();
  description.innerText = event.description;
  location.innerText = event.location;
}


const  deleteAndReturnRandomElement = array => {
  const index = Math.floor(Math.random() * array.length);
  const res = array[index];
  array = array.filter(e => e._id !== res._id);
  return res;
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
  const firstAdditionalImageInput = document.querySelector('#additional-images .additional-image:first-child')

  if (firstAdditionalImageInput) {
    const lastAdditionalImageInputContainer = firstAdditionalImageInput.closest('#additional-images')
    if (lastAdditionalImageInputContainer) {
      handleAppendAdditionalImageInput(firstAdditionalImageInput, lastAdditionalImageInputContainer)
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
        redirect('/profile')
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

const handleCalendar = async () => {
  const placeholder = document.getElementById('placeholder')

  if (placeholder) {
    const loading = createElement('div', `<img src="/images/loading.jpg" alt="loading">`, [ 'loading' ])
    placeholder.append(loading)
  }

  const response = await fetch(`${window.location.origin}/profile/my-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (response.status === 200) {
    const { events } = await response.json()

    let eventDates = {}
    events.forEach(event => {
      let startsOn = new Date(event.startsOn);
      let endsOn = new Date(event.endsOn);

      for (let date = startsOn; date <= endsOn; date.setDate(date.getDate() + 1)) {
        let formattedDate = date.toISOString().split('T')[0]
        const calendarEvent = {
          title: event.title,
          location: event.location,
          id: event._id
        }

        if (!eventDates[formattedDate]) {
          eventDates[formattedDate] = []
        }

        eventDates[formattedDate].push(calendarEvent);
      }
    });

    const flatpickrChange = (date, key)=> {
      let contents = `<h5 class="w-100">Ваші події <span class="date">${new Date(date).toLocaleDateString()}</span>:</h5>`;
      if (date.length) {
        for (let i = 0; i < eventDates[key].length; i++) {
          const { id, title, location } = eventDates[key][i]
          contents += `<div class="col-4">
                         <div class="event">
                           <a href="/events/${id}">
                             <span class="title">${title}</span>
                             <span class="location">${location}</span>
                           </a>
                         </div>
                       </div>`;
        }
      }

      const calendarEvents = document.querySelector(".calendar-events")
      if (calendarEvents) {
        calendarEvents.innerHTML = contents;
      }
    }

    if (placeholder) {

      const loading = placeholder.querySelector('.loading')
      if (loading) {
        loading.remove()
      }

      placeholder.flatpickr({
        inline: true,
        minDate: 'today',
        maxDate: new Date(new Date().setMonth(new Date().getMonth() + 9)),
        showMonths: 3,
        enable: Object.keys(eventDates),
        disableMobile: "true",
        onChange: flatpickrChange,
        locale: {
          weekdays: {
            shorthand: [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
            longhand: [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]
          }
        }
      })
    }
  }
}

const handleEditEventForm = () => {
  const editEventForm = document.querySelector('.edit-event-form')

  if (editEventForm) {

    const deleteSelectedImagesButtons = editEventForm.querySelectorAll('.delete-selected-image')
    if (deleteSelectedImagesButtons) {
      deleteSelectedImagesButtons.forEach(button => {
        button.onclick = () => {
          const formItem = button.closest('.form-item')
          const selectedImage = button.closest('.selected-image')

          if (selectedImage && formItem) {
            selectedImage.remove()

            if (formItem.children.length === 0) {
              formItem.remove()
            }
          }
        }
      })
    }

    if (editEventForm.image) {
      editEventForm.image.onchange = event => {
        if (event.target.files[0] && event.target.files[0].size > 0 && event.target.files[0].name.trim() !== '') {
          const container = editEventForm.image.closest('.form-item')
          if (container) {
            const selectedImage = container.querySelector('.selected-image')

            if (selectedImage) {
              selectedImage.remove()
            }
          }
        }
      }
    }

    editEventForm.onsubmit = async event => {
      event.preventDefault()
      let formData = new FormData(editEventForm)

      if (formData.get('image').size === 0 || formData.get('image').name.trim() === '') {
        formData.set('image', undefined)
      }

      formData.delete('additionalImages')
      formData.delete('city')
      formData.delete('country')
      formData.set('location', `${editEventForm.country.value}, ${editEventForm.city.value}`)

      if (!editEventForm.image.files[0] || editEventForm.image.files[0].size === 0 || editEventForm.image.files[0].name.trim() === '') {
        const selectedImage = editEventForm.querySelector('.selected-image.main-selected-image')

        if (selectedImage) {
          const { name } = selectedImage.dataset

          if (name) {
            const image = await fetchFile(`/uploads/images/events/${name}`, name)
            formData.set('image', image)
          }
        }
      }

      if (isIterable(editEventForm.additionalImages)) {
        editEventForm.additionalImages.forEach(image => {
          const file = image.files[0]

          if (file && (file.size > 0 || file.name.trim() !== '')){
            formData.append('additionalImages', file)
          }
        })
      } else {
        if (editEventForm.additionalImages.files && editEventForm.additionalImages.files.length > 0) {
          const file = editEventForm.additionalImages.files[0]

          if (file && (file.size > 0 || file.name.trim() !== '')){
            formData.append('additionalImages', file)
          }
        }
      }

      const selectedAdditionalImages = editEventForm.querySelectorAll('#additional-images .additional-image.selected')

      if (selectedAdditionalImages) {
        for (let i = 0; i < selectedAdditionalImages.length; i++) {
          const image = selectedAdditionalImages[i]
          const { name } = image.dataset

          if (name) {
            const file = await fetchFile(`/uploads/images/events/${name}`, name)
            if (file && file.size > 0 && file.name.trim() !== '') {
              formData.append('additionalImages', file)
            }
          }
        }
      }

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData
      })

      if (response.status === 200) {
        redirect('/profile')
      } else {
        const { error } = await response.json()
        const errorsContainer = editEventForm.querySelector('.errors')
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    editEventForm.onchange = () => {
      const errorsContainer = editEventForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

const handleEditUserForm = () => {
  const editUserForm = document.querySelector('.edit-user-form')

  if (editUserForm) {

    const deleteSelectedImagesButtons = editUserForm.querySelectorAll('.delete-selected-image')
    if (deleteSelectedImagesButtons) {
      deleteSelectedImagesButtons.forEach(button => {
        button.onclick = () => {
          const formItem = button.closest('.form-item')
          const selectedImage = button.closest('.selected-image')

          if (selectedImage && formItem) {
            selectedImage.remove()

            if (formItem.children.length === 0) {
              formItem.remove()
            }
          }
        }
      })
    }

    if (editUserForm.profilePicture) {
      editUserForm.profilePicture.onchange = event => {
        if (event.target.files[0] && event.target.files[0].size > 0 && event.target.files[0].name.trim() !== '') {
          const container= editUserForm.profilePicture.closest('.form-item')
          if (container) {
            const selectedImage = container.querySelector('.selected-image')

            if (selectedImage) {
              selectedImage.remove()
            }
          }
        }
      }
    }

    editUserForm.onsubmit = async event => {
      event.preventDefault()
      let formData = new FormData(editUserForm)

      if (!editUserForm.password.value || editUserForm.password.value.trim() === '') {
        formData.delete('password')
      }

      if (formData.get('profilePicture').size === 0 || formData.get('profilePicture').name.trim() === '') {
        formData.set('profilePicture', undefined)
      }

      if (!editUserForm.profilePicture.files[0] || editUserForm.profilePicture.files[0].size === 0 || editUserForm.profilePicture.files[0].name.trim() === '') {
        const selectedImage = editUserForm.querySelector('.selected-image.main-selected-image')

        if (selectedImage) {
          const { name } = selectedImage.dataset
          if (name) {
            const image = await fetchFile(`/uploads/images/users/${name}`, name)
            formData.set('profilePicture', image)
          }
        }
      }

      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: formData
      })

      if (response.status === 200) {
        redirect('/profile')
      } else {
        const { error } = await response.json()
        const errorsContainer = editUserForm.querySelector('.errors')
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    editUserForm.onchange = () => {
      const errorsContainer = editUserForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

const handleDeleteEventsButtons = () => {
  const deleteEventsButtons = document.querySelectorAll('.delete-event')

  if (deleteEventsButtons) {
    deleteEventsButtons.forEach(button => {
      button.onclick = async () => {
        const { id } = button.dataset

        if (id) {
          const response = await fetch(`/events/delete/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (response.status === 200) {
            redirect('/profile')
          }
        }
      }
    })
  }
}

document.onreadystatechange = async () => {
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
    handleEditEventForm()
    handleEditUserForm()
    handleDeleteEventsButtons()
    await handleCalendar()
    await handleEventsPage()
  }
}