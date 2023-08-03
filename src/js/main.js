/* eslint-disable no-alert */
import "../assets/scss/main.scss";

import { set, ref, push, onChildAdded } from "firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { db, auth } from "./firebaseConfig";

const userId = localStorage.getItem("uid");
let userName;
let userEmail;

const messageContent = document.getElementById("js-message");
const form = document.getElementById("js-form");
const messagesList = document.getElementById("js-messages");
const sendMessageButton = document.getElementById("js-send");
const messagesListRef = ref(db, "messages/");

const createUser = async (email, password) => {
  userName = prompt("Please enter your name");
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    userEmail = res.user.email;
    updateProfile(auth.currentUser, {
      displayName: userName,
    });
    localStorage.setItem("userId", res.user.uid);
    localStorage.setItem("username", userName);

    Promise.resolve(res);
  } catch (error) {
    throw new Error(error.message);
  }
};

const login = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("userId", res.user.uid);
    userEmail = res.user.email;
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      createUser(email, password);
      return;
    }
    throw new Error(error.message);
  }
};

if (!userId) {
  userEmail = prompt("Please enter your email");
  const userPassword = prompt("Please enter your password");

  if (userEmail && userPassword) {
    login(userEmail, userPassword, userName);
  }
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
  if (messageContent.value === "") {
    return;
  }
  sendMessage(userName, userEmail);
});

sendMessageButton.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (messageContent.value === "") {
      return;
    }
    sendMessage(userName, userEmail);
  }
});

loadMessages();
