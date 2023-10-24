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
    let fav = '<i class="fa-regular fa-star fav-icon"></i>';
    if (isFavorite) {
        fav = '<i class="fa-solid fa-star fav-icon"></i>'
    }

    return $(`
    <li id="${story.storyId}">
        <div class="row">
            ${fav}
            <a href="${story.url}" target="a_blank" class="story-link">
                ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
        </div>
        <div class="row">
            <small class="story-author">by ${story.author}</small>
        </div>
        <div class="bottom-row">
            <small class="story-user">posted by ${story.username}</small>
            <button class="delete-button"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <hr>
    </li>
 
    `);
//     return $(`
//       <li id="${story.storyId}">
//       <div class="row">
//       <div class="column">
//       ${fav}
//
// </div>
// </div>
// <!--      <button class="delete-button" ><i class="fa-solid fa-xmark"></i></button>-->
//
//
//         <a href="${story.url}" target="a_blank" class="story-link">
//           ${story.title}
//         </a>
// <!--        <small class="story-hostname">(${hostName})</small>-->
// <!--        <small class="story-author">by ${story.author}</small>-->
// <!--        <small class="story-user">posted by ${story.username}</small>-->
// <!--        <hr>-->
//       </li>
//     `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(type) {
    let stories = $allStoriesList;
    let list = storyList.stories;
    if (type === 'all') {
        console.debug("putStoriesOnPage - ALL");
    } else {
        console.debug("putStoriesOnPage - FAVORITES");
        stories = $favoriteStoriesList;
        list = currentUser.favorites;
    }

    stories.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of list) {
        const $story = generateStoryMarkup(story);
        stories.append($story);
    }

    // Add a listener on the favorite icon
    $('.fav-icon').on('click', async function (ev) {
        // Find the story we clicked on in the story list (so we can get a story object)
        const story = storyList.stories.find(s => s.storyId === ev.target.parentElement.id)

        if (ev.target.className === 'fa-regular fa-star fav-icon') {
            // This is not a favorite add it to the favorite list on the backend and front end
            await currentUser.addFavorite(story)
            currentUser.favorites.push(story)
            ev.target.classList.replace('fa-regular', 'fa-solid')
        } else {
            // This was a favorite remove it from the favorite list on the backend and front end
            await currentUser.removeFavorite(story)
            const index = storyList.stories.indexOf(story)
            currentUser.favorites.splice(index, 1)
            ev.target.classList.replace('fa-solid', 'fa-regular');
        }
    })

    $('.delete-button').on('click', async function (ev) {
        // Grab the element
        const storyElement = ev.target.parentElement

        // Find the story and remove it from the backend and the front end
        const story = storyList.stories.find(s => s.storyId === storyElement.id)
        await StoryList.removeStory(story.storyId)
        const index = storyList.stories.indexOf(story)
        storyList.stories.splice(index, 1)

        // Remove the story from the page
        $(storyElement).remove()
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

