// Redirects to the specific path
const redirect = path => {
  const url = new URL(path, location.origin)
  location.replace(url)
}

// Checks if the object is iterable
const isIterable = object => object != null && typeof object[Symbol.iterator] === 'function'

// Fetches the file from the server by its name and path
const fetchFile = async (filepath, filename) => {
  const image = await fetch(filepath)
  const blob = await image.blob()
  return new File([blob], filename, blob)
}

// Gets the cookie value by its name
const getCookieByName = name => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match)
    return match[2];
}

// Creates html element and sets the content inside it. Also it is possible to pass classList and id for this element
const createElement = (tag, content, classList = [], id) => {
  const element = document.createElement(tag)

  if (id) {
    element.id = id
  }

  classList.forEach(classItem => element.classList.add(classItem))
  element.innerHTML = content
  return element
}

// Creates chat message html to show it on the chat page
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
        <img src="${profileImagePath}" alt="User profile photo" onerror="this.src='/images/default-user-image.jpg'; this.onerror='';">
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

// Handles window onclick events
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

// Handles window resize events
const handleWindowResize = () => {
  let calendarMobile = window.innerWidth < 1200;
  let chatListMobile = window.innerWidth < 768

  window.onresize = async () => {

    if (window.innerWidth < 768 && !chatListMobile || window.innerWidth >= 768 && chatListMobile) {
      handleShowChatsButton()
      chatListMobile = window.innerWidth < 768
    }

    if (window.innerWidth < 1200 && !calendarMobile || window.innerWidth >= 1200 && calendarMobile) {
      const calendar = document.querySelector('#calendar > .flatpickr-calendar')

      if (calendar) {
        calendar.remove()
        calendarMobile = window.innerWidth < 1200
        await handleCalendar()
      }
    }
  }
}

// Handles web application navigation bar. Adds special classes and onclick events to navigation links
const handleNavbar = () => {
  const navbar = document.querySelector('.navbar')

  if (navbar) {
    const navbarButtons = navbar.querySelectorAll('.navigation > .link')
    navbarButtons.forEach(button => {
      if (button.href && window.location.pathname.trim() !== '/' || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
        if (`${window.location.origin}${window.location.pathname}`.includes(button.href) || (window.location.pathname.trim() === '/' && button.href === `${window.location.origin}/events`)) {
          button.classList.add('active')
        }
      }
    })

    const profileContainer = navbar.querySelector('.navbar > .profile-container')
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

// Handles sign in form. Validates all fields and sends the data to the server
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
        errorsContainer.innerHTML = ''
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    signInForm.onchange = event => {
      const errorsContainer = signInForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

// Handles sign up form. Validates all fields and sends the data to the server
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
        errorsContainer.innerHTML = ''
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    signUpForm.onchange = event => {
      const errorsContainer = signUpForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

// Handles logout request. Sends the request to the server
const handleLogout = () => {
  const logoutButtons = document.querySelectorAll('.navbar .logout')
  if (logoutButtons) {
    logoutButtons.forEach(button => {
      button.onclick = async event => {
        const response = await fetch('http://localhost:8000/logout', {
          method: "POST",
        })
        if (response.status === 200) {
          redirect('/sign-in')
        }
      }
    })
  }
}

// Handles receiving the message from another users in the same active chat
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

// Handles sending the message in the active chat
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

// Fetches the list of chats and shows it in the user interface
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

// Handles events page. Fetches the list of available events and shows them to user
const handleEventsPage = async () => {
  const pathname = window.location.pathname

  let eventsList;
  if (pathname === '/' || pathname.match(new RegExp('^/events/?$'))) {
    const eventFiltersForm = document.querySelector('.event-filters-form')
    let filters = {}

    if (eventFiltersForm) {
      filters = {
        startsOn: new Date(eventFiltersForm.startsOn.value),
        endsOn: new Date(eventFiltersForm.endsOn.value),
        location: `${eventFiltersForm.country.value ?? ''}, ${eventFiltersForm.city.value ?? ''}`
      }
    }

    const response = await fetch(`${window.location.origin}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      const { events } = await response.json()
      eventsList = structuredClone(events);
      eventsList = eventsList.filter(event => {
        if (filters.startsOn && new Date(event.startsOn) < filters.startsOn) {
          return false
        }

        if (filters.endsOn && new Date(event.endsOn) > filters.endsOn) {
          return false
        }

        return !(filters.location && !event.location.includes(filters.location))
      })

      if (eventsList.length > 0) {
        let currentEvent = returnRandomElement(eventsList);
        eventsList = eventsList.filter(e => e._id !== currentEvent._id);
        showEventBlock(currentEvent);

        const eventButtons = document.querySelectorAll('.event-button');
        eventButtons.forEach(button => {
          button.onclick = async () => {
            if (button.getAttribute('id') === 'join-request') {
              const response = await fetch(`/events/join/${currentEvent._id}`, {
                method: 'POST',
              })

              if(response.status === 200)
                alert('Запит на приєднання надіслано успішно!');
              else
                alert('Ви вже надіслали запит,чекайте на відповідь!');
            }
            currentEvent = returnRandomElement(eventsList);
            eventsList = eventsList.filter(event => event._id !== currentEvent._id);

            if (eventsList.length === 0)
              eventsList = events.filter(event => event._id.toString() !== currentEvent._id.toString());

            showEventBlock(currentEvent);
          }
        });
      } else {
        const container = document.querySelector('.main-activities > .row')
        if (container) {
          container.remove()
        }
      }
    }
  }
}

// Creates event view when it is loaded on the events page.
const showEventBlock = event => {
  const title = document.querySelector('#title');
  const dateRange = document.querySelector('.date-range')
  const location = document.querySelector('#location');
  const duration = document.querySelector('#duration');
  const participants = document.querySelector('#participants');
  const description = document.querySelector('#description');
  const image = document.querySelector('#event-img');
  const organizer = document.querySelector('#organizer');
  const detailsButton = document.querySelector('#details-button')

  const canLoadData = event && title && dateRange && location && duration && participants && description && image && organizer && detailsButton

  if (canLoadData) {
    if (event.image === 'default-event-image.jpg')
      image.setAttribute('src',`/images/${event.image}`)
    else
      image.setAttribute('src',`/uploads/images/events/${event.image}`)

    image.setAttribute('onerror', "this.src='/images/default-event-image.jpg'; this.onerror='';")

    const startsOn = new Date(event.startsOn)
    const endsOn = new Date(event.endsOn)
    const startsOnString = startsOn.toLocaleString('uk', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const endsOnString = endsOn.toLocaleString('uk', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const dateRangeValue = `${startsOnString} - ${endsOnString}`

    const timeDifference = Math.abs(startsOn.getTime() - endsOn.getTime())
    let durationValue
    if (timeDifference < 1000) {
      durationValue = `${Math.ceil(timeDifference)} milliseconds`
    } else if (timeDifference < 60 * 1000) {
      durationValue = `${Math.ceil(timeDifference / 1000)} seconds`
    } else if (timeDifference < 60 * 60 * 1000) {
      durationValue = `${Math.ceil(timeDifference / (60 * 1000))} minutes`
    } else if (timeDifference < 24 * 60 * 60 * 1000) {
      durationValue = `${Math.ceil(timeDifference / (60 * 60 * 1000))} hours`
    } else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
      durationValue = `${Math.ceil(timeDifference / (24 * 60 * 60 * 1000))} days`
    } else if (timeDifference < 365 * 24 * 60 * 60 * 1000) {
      durationValue = `${Math.ceil(timeDifference / (7 * 24 * 60 * 60 * 1000))} weeks`
    } else {
      durationValue = `${Math.ceil(timeDifference / (365 * 24 * 60 * 60 * 1000))} years`
    }

    dateRange.innerText = dateRangeValue
    title.innerText = event.title
    duration.innerText = `~${durationValue}`
    participants.innerText = `${event.participants.length.toString()} joined`
    description.innerText = event.description
    location.innerText = event.location
    organizer.innerText = `${event.organizer.firstName} ${event.organizer.lastName}`
    organizer.setAttribute('href', `/users/${event.organizer._id}`)
    detailsButton.setAttribute('href', `/events/${event._id}`)
  }
}

// Returns random element from the array
const returnRandomElement = array => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

// Handles join request selector. Adds onchange function on it
const handleJoinRequestSelect = () => {
  const joinRequestSelect = document.querySelector('.join-requests-type')

  if (joinRequestSelect) {
    joinRequestSelect.onchange = event => {
      redirect(`/profile/join-requests/${event.target.value}`)
    }
  }
}

// Handles join requests buttons (actions accept/reject) and sends the data to the server
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

// Handles appending of additional images
const handleAppendAdditionalImageInput = (input, container) => {
  if (input && container) {
    input.onchange = () => {
      input.onchange = undefined
      const html =`<label><input type="file" class="w-100" name="additionalImages"></label>`
      const newInput = createElement('div', html, [ 'form-item', 'col-12', 'col-md-6', 'additional-image' ])
      container.insertBefore(newInput, container.firstChild)
      handleAppendAdditionalImageInput(newInput, container)
    }
  }
}

// Defines the behaviour of additional images container
const handleAdditionalImagesContainer = () => {
  const firstAdditionalImageInput = document.querySelector('#additional-images .additional-image:first-child')

  if (firstAdditionalImageInput) {
    const lastAdditionalImageInputContainer = firstAdditionalImageInput.closest('#additional-images')
    if (lastAdditionalImageInputContainer) {
      handleAppendAdditionalImageInput(firstAdditionalImageInput, lastAdditionalImageInputContainer)
    }
  }
}

// Handles create event form. Validates all fields and sends the data to the server
const handleCreateEventForm = () => {
  const createEventForm = document.querySelector('.create-event-form')

  if (createEventForm) {
    createEventForm.onsubmit = async event => {
      event.preventDefault()
      let formData = new FormData(createEventForm)

      if (formData.get('image').size === 0 || formData.get('image').name.trim() === '') {
        formData.delete('image')
      }

      formData.delete('additionalImages')
      formData.delete('city')
      formData.delete('country')
      formData.set('location', `${createEventForm.country.value}, ${createEventForm.city.value}`)

      if (isIterable(createEventForm.additionalImages)) {
          createEventForm.additionalImages.forEach(image => {
            const file = image.files[0]

            if (file && (file.size > 0 || file.name.trim() !== '')){
              formData.append('additionalImages', file)
            }
          })
      } else {
        if (createEventForm.additionalImages.files && createEventForm.additionalImages.files.length > 0) {
          const file = createEventForm.additionalImages.files[0]

          if (file && (file.size > 0 || file.name.trim() !== '')){
            formData.append('additionalImages', file)
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
        const errorsContainer = createEventForm.querySelector('.errors')
        errorsContainer.innerHTML = ''
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    createEventForm.onchange = () => {
      const errorsContainer = createEventForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

// Handles calendar page. Fetches the events user takes part in and shows them in the calendar
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
          contents += `<div class="col-12 col-md-6 col-lg-4">
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
        minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 5)),
        maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
        showMonths: window.innerWidth < 1200 ? 1 : 3,
        enable: Object.keys(eventDates),
        disableMobile: "false",
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

// Handles edit event form. Validates all fields and sends the data to the server
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
        formData.delete('image')
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
        errorsContainer.innerHTML = ''
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    editEventForm.onchange = () => {
      const errorsContainer = editEventForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

// Handles edit user form. Validates all fields and sends the data to the server
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
        errorsContainer.innerHTML = ''
        errorsContainer.append(createElement('span', error, [ 'error' ]))
      }
    }

    editUserForm.onchange = () => {
      const errorsContainer = editUserForm.querySelector('.errors')
      errorsContainer.innerHTML = ''
    }
  }
}

// Handles delete events buttons. Sends the data to the server
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

// Handles sending of join request buttons. Sends the data to the server
const handleSendJoinRequestButtons = () => {
  const sendJoinRequestButtons = document.querySelectorAll('.send-join-request')

  if (sendJoinRequestButtons) {
    sendJoinRequestButtons.forEach(button => {
      const { id } = button.dataset
      button.onclick = async () => {
        const response = await fetch(`/events/join/${id}`, {
          method: 'POST',
        })

        if (response.status === 200)
          alert('Запит на приєднання надіслано успішно!');
        else
          alert('Ви вже надіслали запит,чекайте на відповідь!');
      }
    })
  }
}

// Handles the behaviour of the button that shows the list of chats
const handleShowChatsButton = () => {
  const showChatsButton = document.querySelector('.show-chats')

  if (showChatsButton) {
    showChatsButton.onclick = () => {
      const chats = document.querySelector('.events')

      if (chats) {
        chats.classList.add('visible')
      }
    }
  }
}

// Handles the button that shows mobile menu
const handleShowMobileMenu = () => {
  const showMobileMenuButton = document.querySelector('.show-mobile-menu')

  if (showMobileMenuButton) {
    showMobileMenuButton.onclick = () => {
      const mobileMenu = document.querySelector('.mobile-menu')

      if (mobileMenu) {
        mobileMenu.style.display = 'flex'
      }
    }
  }
}

// Handles the button that hides mobile menu
const handleHideMobileMenu = () => {
  const hideMobileMenuButton = document.querySelector('.hide-mobile-menu')

  if (hideMobileMenuButton) {
    hideMobileMenuButton.onclick = () => {
      const mobileMenu = document.querySelector('.mobile-menu')

      if (mobileMenu) {
        mobileMenu.removeAttribute('style')
      }
    }
  }
}

// Handles the button that shows filters
const handleShowFilters = () => {
  const showFiltersButton = document.querySelector('.show-filters')

  if (showFiltersButton) {
    showFiltersButton.onclick = () => {
      const filters = document.querySelector('.sidebar-activities')

      if (filters) {
        filters.style.display= 'flex'
      }
    }
  }
}

// Handles the button that hides filters
const handleHideFilters = () => {
  const hideFiltersButton = document.querySelector('.hide-filters')

  if (hideFiltersButton) {
    hideFiltersButton.onclick = () => {
      const filters = document.querySelector('.sidebar-activities')

      if (filters) {
        filters.removeAttribute('style')
      }
    }
  }
}

// Waiting while the page is loaded and running all functions written above
document.onreadystatechange = async () => {
  if (document.readyState === 'complete') {
    handleWindowOnclick()
    handleWindowResize()
    handleShowMobileMenu()
    handleHideMobileMenu()
    handleShowFilters()
    handleHideFilters()
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
    handleSendJoinRequestButtons()
    handleShowChatsButton()
    await handleCalendar()
    await handleEventsPage()
  }
}