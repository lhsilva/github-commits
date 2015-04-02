Polymer({
    /**
     * "username" is the github username of the user we want to use.
     *
     * @property username
     * @type string
     * @default ""
     */
    username: "",

    nrOfPushes: 10,

    isDebugEnabled: false,

    ready: function () {
        this.tableHeaders = {
            pushDateTime: "Push Date and Time",
            repository: "Repository",
            commitMessage: "Commit Message"
        };

        this.events = [];
        this.retrieveGithubLatestEvents(this.buildGithubPushesTable, this);
    },

    //latest 90 days github public repos events
    retrieveGithubLatestEvents: function (callback, scope) {
        var url = "https://api.github.com/users/" + this.username + "/events/public",
            httpRequest;

        try {
            httpRequest = new XMLHttpRequest();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState === 4 && httpRequest.status === 200) {
                    var events = JSON.parse(httpRequest.responseText);
                    callback.call(scope, events);
                }
            };
            httpRequest.open("GET", url, true);
            httpRequest.send(null);
        } catch (ex) {
            if (this.isDebugEnabled) {
                console.log("Error while creating a request to " + url);
            }
        }
    },

    buildGithubPushesTable: function (events) {
        var counter = 1;

        for (var i = 0, n = events.length; i < n && counter <= this.nrOfPushes; i++) {
            var event = events[i];

            // Other events include Creation, Watch and so on.
            if (event && event.type === "PushEvent" && event.actor.login === this.username) {
                this.createTableRow(event, counter);
                counter++;
            }
        }
    },

    createTableRow: function (rawEvent, counter) {
        var creationDateComplete = new Date(rawEvent.created_at),
            repository = rawEvent.repo,
            commit = rawEvent.payload.commits[0],
            event = {
                id: counter,
                creationDate: creationDateComplete.toLocaleDateString(),
                creationTime: creationDateComplete.toLocaleTimeString(),
                repositoryName: repository.name,
                commitSha: commit.sha,
                commitMessage: commit.message
            };

        this.events.push(event);
    }
});