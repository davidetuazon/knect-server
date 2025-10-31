const app = require('./app');
require('./src/shared/helpers/cleanUpLikesSkips');
const http = require('http');
const { initSocket } = require('./src/socket');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});