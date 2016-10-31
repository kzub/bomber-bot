const http = require('http');
const app = require('../app');

const server = http.Server(app);

var port = process.env.PORT || 3210;

server.listen(port, function () {
    console.log('Express server listening on port ' + port);
});