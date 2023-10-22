"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();

    const isFavorite = currentUser.favorites.find(s => s.storyId === story.storyId);
    let fav = '<i class="fa-regular fa-star"></i>';
    if (isFavorite) {
        fav = '<i class="fa-solid fa-star"></i>'
    }
    return $(`
      <li id="${story.storyId}">
      ${fav}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
    console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    $('i').on('click', async function(ev) {
        const story = ev.target.parentElement.id

        if (ev.target.className === 'fa-regular fa-star') {
            await currentUser.addFavorite(story)
            ev.target.className = 'fa-solid fa-star'
        } else {
            await currentUser.removeFavorite(story)
            ev.target.className = 'fa-regular fa-star';
        }
    })


    $allStoriesList.show();
}

async function submitStory(evt) {
    evt.preventDefault();
    await StoryList.addStory($("#submit-title").val(), $("#submit-author").val(), $("#submit-url").val())
    $submitForm.hide()
    $submitForm.trigger("reset");
    await getAndShowStoriesOnStart()
}

$submitForm.on('submit', submitStory);

