import bot from './assets/bot.png'
import user from './assets/science.png'

// Select the form element and the chat container element
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

// AI loads and then responds with text
function loader(element) {
  // Clear the text content of the element
  element.textContent = ''

  // Set an interval to append '.' to the element's text content every 300ms
  loadInterval = setInterval(() => {
    element.textContent += '.';

    // If the element's text content is '....', clear it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

// AI responds by typing one letter at a time
function slowType(element, text) {
  let index = 0

  // Set an interval to append one letter to the element's innerHTML every 20ms
  let interval = setInterval(() => {
    if(index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      // Clear the interval when all the letters have been typed
      clearInterval(interval)
    }
  }, 20)
}

// Generate a unique ID using a timestamp and a random hexadecimal
function generateUniqueId() 
  {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Return an HTML string for a chat stripe
function chatStripe (isAi, value, uniqueId) {
    return (
  ` 
    <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
    <div class="profile">
    <img
      src="${isAi ? bot : user}"
      alt="${isAi ? 'bot' : 'user'}"
    />
    </div>
    <div class="message" id=${uniqueId}>${value}</div>
    </div>
    </div> 
    `
  )
}

/* The handleSubmit function is using the innerHTML property to 
update the chatContainer element, which may be inefficient and can 
potentially introduce security vulnerabilities if the user input is 
not properly sanitized. Consider using the textContent property or 
the insertAdjacentHTML method instead. */

const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Get the form data from the form element
  const data = new FormData(form)
  
  // Add the user's chat stripe to the chat container
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  
  // Reset the form
  form.reset()
  
  // Generate a unique ID
  const uniqueId = generateUniqueId();
  
  // Add the bot's chat stripe to the chat container
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
  
  // Keep the chat container scrolled to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Get the message element by its unique ID
  const messageDiv = document.getElementById(uniqueId)
  
  // Show the loading animation for the bot's message
  loader(messageDiv)

  //fetch data from server -> bot's response

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval)
  messageDiv.innerHTML = ''

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim()

    slowType(messageDiv, parsedData)
  } else{
    const erre = await response.text()

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
  }
  
  
  // Add a submit event listener to the form element
  form.addEventListener('submit', handleSubmit)
  
  // Add a keyup event listener to the form element
  form.addEventListener('keyup', (e) => {
  // If the key that was pressed is the Enter key (keyCode 13)
  if (e.keyCode === 13) {
  // Submit the form
  handleSubmit(e)
  }
})