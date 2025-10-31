const app = require('./app');
require('./src/shared/helpers/cleanUpLikesSkips');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});