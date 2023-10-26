"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");
  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  }


  $signupForm.trigger("reset");
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}


/******************************************************************************
 * User favorite/unfavorite
 */
async function toggleFavorite(ev){
  console.debug('toggleFavorite')
  // Find the story we clicked on in the story list (so we can get a story object)
  const storyId = getParentElement(ev.target, 3).id
  // We can add a favorite from two places (all stories and favorites view) so we need to find the object in the
  // correct list
  const story = findStoryObject(storyId)

  if (ev.target.className === 'fa-regular fa-star fav-icon') {
    // This is not a favorite add it to the favorite list on the backend and front end
    await currentUser.addFavorite(story)
    currentUser.favorites.push(story)
    ev.target.classList.replace('fa-regular', 'fa-solid')
  } else {
    // This was a favorite remove it from the favorite list on the backend and front end
    await currentUser.removeFavorite(story)

    // Remove from local list
    let index = currentUser.favorites.indexOf(story)
    currentUser.favorites.splice(index, 1)
    ev.target.classList.replace('fa-solid', 'fa-regular');
  }
}

function findStoryObject(storyId) {
  // Search both possible lists of stories and return the story index
  const story = storyList.stories.find(s => s.storyId === storyId)
  const favoriteStory = currentUser.favorites.find(s => s.storyId === storyId)
  for (let foundStory of [story, favoriteStory]) {
    if (foundStory !== 'undefined') {
      return foundStory
    }
  }
}

/******************************************************************************
 * User profile
 */

async function userProfile(evt) {
  console.debug("userProfile", evt);
  evt.preventDefault();

  // grab the name and password
  const username = $("#profile-name").val();
  const password = $("#profile-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await currentUser.updateUser(username, password);

  $profileForm.trigger("reset");
  if (currentUser) {
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
    logout()
    alert('You have changed your name or password so you must log in again')
  }
}

$profileForm.on('submit', userProfile)