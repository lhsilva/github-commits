/*global Polymer, XMLHttpRequest*/
Polymer('github-commits', {
    /**
     * "username" is the github username of the user we want to use.
     *
     * @property username
     * @type string
     * @default ""
     */
    username: "",

    /**
     * "maxCommits" is the maximum number of Commits we want to retrieve.
     *
     * @property commits
     * @type number
     * @default 10
     */
    maxCommits: 10,


    /**
     * "tableHeaders" is the aggregator of the table headers values.
     * 
     * @property tableHeaders
     * @type object
     * @default "Push Date and Time, Repository, Commit Message"
     */
    tableHeaders: {
        pushDateTime: "Push Date and Time",
        repository: "Repository",
        commitMessage: "Commit Message"
    },

    ready: function () {
        'use strict';

        this.commits = [];
        this.getUserPublicEvents(this.onGetUserPublicEventsResponse, this);
    },

    /**
     * Constructs the API url and calls it. On ready state changes, calls the passed callback function.
     * 
     * @param {function} callback
     * @param {object} scope
     */
    getUserPublicEvents: function (callback, scope) {
        'use strict';

        var url = "https://api.github.com/users/" + this.username + "/events/public",
            httpRequest;

        httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                callback.call(scope, httpRequest.responseText);
            }
        };

        httpRequest.open("GET", url, true);
        httpRequest.send(null);
    },

    /**
     * Takes care of the getUserPublicEvents response.
     * 
     * @param {object} response
     */
    onGetUserPublicEventsResponse: function (response) {
        'use strict';

        var events = JSON.parse(response);
        if (events) {
            this.commits = this.extractCommits(events);
        }
    },

    /**
     * Extracts and instantiates an array of Commits from the passed events array.
     * 
     * @param {Array} events
     * @returns {Array} commits
     */
    extractCommits: function (events) {
        'use strict';

        var counter = 1,
            commits = [],
            extractedCommits = [],
            event;

        for (var i = 0, n = events.length; i < n && counter <= this.maxCommits; i++) {
            event = events[i];

            if (event && event.type === "PushEvent") {
                extractedCommits = this.extractCommitsFromPush(event, counter);
                commits = commits.concat(extractedCommits);
                counter += extractedCommits.length;
            }
        }

        return commits;
    },

    /**
     * Creates and returns a small Push Event instance with the needed information from the raw Push Event passed.
     * 
     * @param {object} pushEvent
     * @param {number} counter
     * @returns {object} litePushEvent
     */
    extractCommitsFromPush: function (pushEvent, counter) {
        var creationDateComplete = new Date(pushEvent.created_at),
            repository = pushEvent.repo,
            pushCommits = pushEvent.payload.commits,
            commits = [];

        for (var i = 0, n = pushCommits.length; i < n; i++) {
            commits.push({
                id: counter,
                creationDate: creationDateComplete.toLocaleDateString(),
                creationTime: creationDateComplete.toLocaleTimeString(),
                repositoryName: repository.name,
                commitSha: pushCommits[i].sha,
                commitMessage: pushCommits[i].message
            });

            counter++;
        }

        return commits;
    }
});