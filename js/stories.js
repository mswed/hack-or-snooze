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

function generateStoryMarkup(story, type) {
    // console.debug("generateStoryMarkup", story);

    const hostName = story.getHostName();
    let fav = '<i class="fa-regular fa-star fav-icon"></i>';

    try {
        const isFavorite = currentUser.favorites.find(s => s.storyId === story.storyId);
        if (isFavorite) {
            fav = '<i class="fa-solid fa-star fav-icon"></i>'
        }
    } catch (e) {
        console.warn('User not logged in (probably)')
    }

    let deleteBtn = '';
    if (type === 'user') {
        deleteBtn = '<button class="delete-button"><i class="fa-regular fa-trash-can"></i></i></button>'
    }

    return $(`
    <li id="${story.storyId}">
    <div class="list-item">
    <div class="row">
    ${deleteBtn}
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
            
        </div>
        <hr>
</div>
        
    </li>
 
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(type) {
    console.log('TYPE', type)
    let stories = $allStoriesList;
    let list = storyList.stories;
    if (type === 'all') {
        console.debug("putStoriesOnPage - ALL");
    } else if (type === 'favorites'){
        console.debug("putStoriesOnPage - FAVORITES");
        list = currentUser.favorites;
    } else {
        console.debug("putStoriesOnPage - USER");
        list = currentUser.ownStories;
    }

    stories.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of list) {
        const $story = generateStoryMarkup(story, type);
        stories.append($story);
    }

    // Add a listener on the favorite icon
    $('.fav-icon').on('click',(ev) => toggleFavorite(ev))

    $('.delete-button').on('click', (ev) => {deleteStory(ev)})


    stories.show();
}

async function toggleFavorite(ev){
    console.debug('toggleFavorite')
    // Find the story we clicked on in the story list (so we can get a story object)
    const storyId = getParentElement(ev.target, 3).id
    const story = storyList.stories.find(s => s.storyId === storyId)

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
}

async function deleteStory(ev) {
    // Grab the element
    const storyElement = getParentElement(ev.target, 3)

    // Find the story and remove it from the backend and the front end
    const story = storyList.stories.find(s => s.storyId === storyElement.id)
    const success = await StoryList.removeStory(story.storyId)
    if (success) {
        const index = storyList.stories.indexOf(story)
        storyList.stories.splice(index, 1)

        // Remove the story from the page
        $(storyElement).remove()
    }
}
async function submitStory(evt) {
    evt.preventDefault();
    await StoryList.addStory($("#submit-title").val(), $("#submit-author").val(), $("#submit-url").val())
    $submitForm.slideUp(1000)
    $submitForm.trigger("reset");

    await getAndShowStoriesOnStart()

}

$submitForm.on('submit', submitStory);

function getParentElement(element, level) {
    let parent = element.parentElement
    for (let i = 0; i < level - 1; i++) {
        parent = parent.parentElement
    }
    return parent
}