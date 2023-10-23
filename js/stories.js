"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage('all');
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

function putStoriesOnPage(type) {
    console.debug('Type is', type);
    let stories = $allStoriesList;
    let list = storyList.stories;
    if (type === 'all') {
        console.debug("putStoriesOnPage - ALL");
    } else {
        console.debug("putStoriesOnPage - FAVORITES");
        stories = $favoriteStoriesList;
        console.debug('>>>', stories)
        list = currentUser.favorites;
        console.debug('>>>', list)
    }

    stories.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of list) {
        const $story = generateStoryMarkup(story);
        stories.append($story);
    }

    // Add a listener on the favorite icon
    $('i').on('click', async function(ev) {
        // Find the story we clicked on in the story list (so we can get a story object)
        const story = storyList.stories.find(s => s.storyId === ev.target.parentElement.id)

        if (ev.target.className === 'fa-regular fa-star') {
            // This is not a favorite add it to the favorite list on the backend and front end
            await currentUser.addFavorite(story)
            currentUser.favorites.push(story)
            ev.target.className = 'fa-solid fa-star'
        } else {
            // This was a favorite remove it from the favorite list on the backend and front end
            await currentUser.removeFavorite(story)
            const index = storyList.stories.indexOf(story)
            currentUser.favorites.splice(index, 1)
            ev.target.className = 'fa-regular fa-star';
        }
    })


    stories.show();
}

async function submitStory(evt) {
    evt.preventDefault();
    await StoryList.addStory($("#submit-title").val(), $("#submit-author").val(), $("#submit-url").val())
    $submitForm.hide()
    $submitForm.trigger("reset");
    await getAndShowStoriesOnStart()
}

$submitForm.on('submit', submitStory);

