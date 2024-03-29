"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage('all');
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  // $submitForm.show();
  $submitForm.slideToggle(1000);
  $allStoriesList.show();
}

$navSubmit.on('click', navSubmitClick)

function navFavoriteStoriesClick(evt) {
  console.debug("navFavoriteStoriesClick", evt);
  hidePageComponents();
  putStoriesOnPage('favorites');
}

$navFavorites.on('click', navFavoriteStoriesClick)

function navUserStoriesClick(evt) {
  console.debug("navFavoriteStoriesClick", evt);
  hidePageComponents();
  putStoriesOnPage('user');
}

$navUserStories.on('click', navUserStoriesClick)

function navUserProfileClick(evt) {
  console.debug("navUserProfileClick", evt);
  $profileForm.slideToggle()
}

$navUserProfile.on('click', navUserProfileClick)