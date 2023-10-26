"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// This is a global containing the story being edited
let editedStory;

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
    let editBtn = ''
    if (type === 'user') {
        deleteBtn = '<button class="delete-button"><i class="fa-regular fa-trash-can"></i></button>'
        editBtn = '<button class="edit-button"><i class="fa-solid fa-pencil"></i></button>'
    }

    return $(`
    <li id="${story.storyId}">
    <div class="list-item">
    <div class="row">
    ${deleteBtn}
    ${editBtn}
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

    $('.edit-button').on('click', (ev) => {editStory(ev)})


    stories.show();
}


async function deleteStory(ev) {
    // Grab the element
    const storyElement = getParentElement(ev.target, 3)

    // Find the story and remove it from the backend and the front end
    const story = currentUser.ownStories.find(s => s.storyId === storyElement.id)
    const success = await StoryList.removeStory(story.storyId)
    if (success) {
        const index = currentUser.ownStories.indexOf(story)
        currentUser.ownStories.splice(index, 1)

        // Remove the story from the page
        $(storyElement).remove()
    }
}

async function editStory(ev) {
    // Grab the element
    const storyElement = getParentElement(ev.target, 3)
    editedStory = currentUser.ownStories.find(s => s.storyId === storyElement.id)
    $("#submit-title").val(editedStory.title);
    $("#submit-author").val(editedStory.author);
    $("#submit-url").val(editedStory.url);
    $('#submit-button').text('update');
    $('#story-label').text('Update Story');
    // Show the submit form
    $submitForm.slideToggle()
}

async function submitStory(evt) {
    evt.preventDefault();
    if ($('#submit-button').text() === 'update') {
        // This is an update operation get updated values from the UI
        editedStory.title = $("#submit-title").val();
        editedStory.author = $("#submit-author").val();
        editedStory.url = $("#submit-url").val();
        // Update the backend
        await StoryList.updateStory(editedStory)
        $('#submit-button').text('submit');
        $('#story-label').text('New Story');
        putStoriesOnPage('user');
    } else {
        // This is a new story
        await StoryList.addStory($("#submit-title").val(), $("#submit-author").val(), $("#submit-url").val())
        await getAndShowStoriesOnStart()
    }

    $submitForm.slideUp(1000)
    $submitForm.trigger("reset");



}

$submitForm.on('submit', submitStory);

function getParentElement(element, level) {
    let parent = element.parentElement
    for (let i = 0; i < level - 1; i++) {
        parent = parent.parentElement
    }
    return parent
}