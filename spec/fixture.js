var base = __dirname;
module.exports = {
    "multiple": [{
        "username": "sanket",
        "host": "localhost",
        "password": "sanket",
        "port": 8331
    }, {
        "username": "sanket",
        "host": "ssh-with-key",
        "identity": base + "/test.pem"
    }],
    "couchmultiple": [{
        "username": "sanket",
        "host": "localhost",
        "password": "sanket",
        "port": 8331
    }, {
        "username": "sanket",
        "host": "ssh-with-key",
        "identity": base + "/test.pem"
    }],
    "singleWithPassword": {
        "username": "sanket",
        "host": "localhost",
        "password": "sanket",
        "port": 8331
    },
    "singleWithKey": {
        "username": "sanket",
        "host": "localhost",
        "port": 8332,
        "reconnect": false,
        "identity": base + "/test.pem"
    }
}
