"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

    /** Make instance of Story from data object about story:
     *   - {title, author, url, username, storyId, createdAt}
     */

    constructor({storyId, title, author, url, username, createdAt}) {
        this.storyId = storyId;
        this.title = title;
        this.author = author;
        this.url = url;
        this.username = username;
        this.createdAt = createdAt;
    }

    /** Parses hostname out of URL and returns it. */

    getHostName() {
        const url = new URL(this.url)
        return url.hostname;
    }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
    constructor(stories) {
        this.stories = stories;
    }

    /** Generate a new StoryList. It:
     *
     *  - calls the API
     *  - builds an array of Story instances
     *  - makes a single StoryList instance out of that
     *  - returns the StoryList instance.
     */

    static async getStories() {
        // Note presence of `static` keyword: this indicates that getStories is
        //  **not** an instance method. Rather, it is a method that is called on the
        //  class directly. Why doesn't it make sense for getStories to be an
        //  instance method?

        // query the /stories endpoint (no auth required)
        const response = await axios({
            url: `${BASE_URL}/stories`,
            method: "GET",
        });

        // turn plain old story objects from API into instances of Story class
        const stories = response.data.stories.map(story => new Story(story));

        // build an instance of our own class using the new array of stories
        return new StoryList(stories);
    }

    /** Adds story data to API, makes a Story instance, adds it to story list.
     * - user - the current instance of User who will post the story
     * - obj of {title, author, url}
     *
     * Returns the new Story instance
     */

    static async addStory(title, author, url) {
        /* {token: token,
        * story: {
        * author: name,
        * title: title,
        * url: url }*/
        let request = {
            token: currentUser.loginToken,
            story: {
                title,
                author,
                url
            }
        }

        try {
            const response = await axios.post(`${BASE_URL}/stories`, request);
            const newStory = new Story(response.data.story);
            currentUser.ownStories.push(newStory);
            return newStory
        } catch (err) {
            console.warn('Failed to create a new story!')
            return false;
        }

    }

    static async removeStory(storyId) {
        /* {token: token}*/
        let request = {data: {token: currentUser.loginToken}}

        try {
            const response = await axios.delete(`${BASE_URL}/stories/${storyId}`, request);
            return true;
        } catch (err) {
            if(err.response.status === 403) {
                alert('You are not allowed to delete other people stories!')
            }
            console.warn('Failed to delete the story!')
            return false;
        }

    }

    static async updateStory(story)   {
        let request = {data: {token: currentUser.loginToken,
            story: story}}

        try {
            const response = await axios.patch(`${BASE_URL}/stories/${story.storyId}`, request);
            return true;
        } catch (err) {
            console.log(err)
            if(err.response.status === 403) {
                alert('You are not allowed to delete other people stories!')
            }
            console.warn('Failed to update the story!')
            return false;
        }
    }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
    /** Make user instance from obj of user data and a token:
     *   - {username, name, createdAt, favorites[], ownStories[]}
     *   - token
     */

    constructor({
                    username,
                    name,
                    createdAt,
                    favorites = [],
                    ownStories = []
                },
                token) {
        this.username = username;
        this.name = name;
        this.createdAt = createdAt;

        // instantiate Story instances for the user's favorites and ownStories
        this.favorites = favorites.map(s => new Story(s));
        this.ownStories = ownStories.map(s => new Story(s));

        // store the login token on the user so it's easy to find for API calls.
        this.loginToken = token;
    }

    /** Register new user in API, make User instance & return it.
     *
     * - username: a new username
     * - password: a new password
     * - name: the user's full name
     */

    async addFavorite(story) {
        try {
            const response = await axios.post(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {token: this.loginToken})
        } catch (e) {
            console.warn('Failed to add favorite due to', e)
        }

    }

    async removeFavorite(story) {
        try {
            const response = await axios.delete(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, {data: {token: this.loginToken}})
        } catch (e) {
            console.warn('Failed to delete favorite due to', e)
        }

    }

    async updateUser(name, password){
        let user = {};
        if (name !== '') {
            user['name'] = name;
        }
        if (password !== '') {
            user['password'] = password.toString()
        }

        if ('name' in user || 'password' in user) {
            try {
                let request = {token: currentUser.loginToken,
                        user: user}
                const response = await axios.patch(`${BASE_URL}/users/${this.username}`, request)
                user = response.data.user

                return new User(
                    {
                        username: user.username,
                        name: user.name,
                        createdAt: user.createdAt,
                        favorites: user.favorites,
                        ownStories: user.stories
                    },
                    response.data.token
                );
            } catch(err) {
                console.debug(err)
            }

        }

    }

    static async signup(username, password, name) {
        try {
            const response = await axios({
                url: `${BASE_URL}/signup`,
                method: "POST",
                data: {user: {username, password, name}},
            });

            let {user} = response.data

            return new User(
                {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories
                },
                response.data.token
            );
        } catch (err) {
            if (err.response.status === 409) {
                alert('User name is already taken, pick a different one!')
            }
            return false;
        }

    }

    /** Login in user with API, make User instance & return it.

     * - username: an existing user's username
     * - password: an existing user's password
     */

    static async login(username, password) {

        try {
            const response = await axios({
                url: `${BASE_URL}/login`,
                method: "POST",
                data: {user: {username, password}},
            });

            let {user} = response.data;

            return new User(
                {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories
                },
                response.data.token
            );
        } catch (err) {
            if(err.response.status === 404) {
                alert("We don't have such a user name. Try again")
            } else if (err.response.status === 401) {
                alert("Ooops, wrong password. Try again")
            } else {
                console.debug(err)
            }

            return false;
        }


    }

    /** When we already have credentials (token & username) for a user,
     *   we can log them in automatically. This function does that.
     */

    static async loginViaStoredCredentials(token, username) {
        try {
            const response = await axios({
                url: `${BASE_URL}/users/${username}`,
                method: "GET",
                params: {token},
            });

            let {user} = response.data;

            return new User(
                {
                    username: user.username,
                    name: user.name,
                    createdAt: user.createdAt,
                    favorites: user.favorites,
                    ownStories: user.stories
                },
                token
            );
        } catch (err) {
            console.error("loginViaStoredCredentials failed", err);
            return null;
        }
    }
}
