/* eslint-disable no-alert */
import "../assets/scss/main.scss";

import { set, ref, push, onChildAdded } from "firebase/database";
import db from "./firebaseConfig";

let userName = localStorage.getItem("username");
let userEmail = localStorage.getItem("useremail");

const messageContent = document.getElementById("js-message");
const form = document.getElementById("js-form");
const messagesList = document.getElementById("js-messages");
const messagesListRef = ref(db, "messages/");
if (userName && userEmail) {
  userName = prompt("Please enter your name");
  userEmail = prompt("Please enter your email");
  localStorage.setItem("username", userName);
  localStorage.setItem("useremail", userEmail);
}

const sendMessage = (name, email) => {
  const newMessageRef = push(messagesListRef);
  try {
    set(newMessageRef, {
      username: name,
      email,
      message: messageContent.value,
    });
  } catch (error) {
    throw new Error(error);
  } finally {
    messageContent.value = "";
  }
};

const loadMessages = () => {
  onChildAdded(messagesListRef, (snapshot) => {
    const data = snapshot.val();

    const messageItem = `
    <article class="chat__box__message user">
      <p class="chat__box__message__content">${data.message}</p>
      <span class="chat__box__hour">12:15</span>
    </article>
    `;

    messagesList.innerHTML += messageItem;
  });
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage(userName, userEmail);
});

loadMessages();
