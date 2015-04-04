/*global Polymer, XMLHttpRequest*/
Polymer('github-pushes', {
    /**
     * "username" is the github username of the user we want to use.
     *
     * @property username
     * @type string
     * @default ""
     */
    username: "",

    /**
     * "pushEventsNr" is the number of Push Events we want to retrieve.
     *
     * @property pushes
     * @type number
     * @default 10
     */
    pushEventsNr: 10,


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

        this.pushEvents = [];
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

        var events = JSON.parse(response.responseText);
        if (events) {
            this.pushEvents = this.extractPushEvents(events);
        }
    },

    /**
     * Extracts and instantiates an array of Push Events from the passed events array.
     * 
     * @param {Array} events
     * @returns {Array} pushEvents
     */
    extractPushEvents: function (events) {
        'use strict';

        var counter = 1,
            pushEvents = [],
            event, pushEvent;

        for (var i = 0, n = events.length; i < n && counter <= this.pushEventsNr; i++) {
            event = events[i];

            if (event && event.type === "PushEvent") {
                pushEvent = this.createPushEvent(event, counter);
                pushEvents.push(pushEvent);
                counter++;
            }
        }

        return pushEvents;
    },

    /**
     * Creates and returns a small Push Event instance with the needed information from the raw Push Event passed.
     * 
     * @param {object} pushEvent
     * @param {number} counter
     * @returns {object} litePushEvent
     */
    createPushEvent: function (pushEvent, counter) {
        var creationDateComplete = new Date(pushEvent.created_at),
            repository = pushEvent.repo,
            commit = pushEvent.payload.commits[0],
            litePushEvent = {
                id: counter,
                creationDate: creationDateComplete.toLocaleDateString(),
                creationTime: creationDateComplete.toLocaleTimeString(),
                repositoryName: repository.name,
                commitSha: commit.sha,
                commitMessage: commit.message
            };

        return litePushEvent;
    }
});