const ApiBuilder = require('claudia-api-builder');
const app = new ApiBuilder();

const { WELCOME_MESSAGE, SECRET } = require('./env.js');
const { details, query, download, status } = require('./impl.js');

app.intercept(req => {
    if (req.headers['secret'] === SECRET) {
        return req;
    }
    console.log(`Header Secret, value ${SECRET}`);
    return new ApiBuilder.ApiResponse('You must provide the correct secret.', {'Content-Type': 'text/plain'}, 403);
});

app.get('/', () => ({ message: WELCOME_MESSAGE }));

app.get('/details', details);
app.get('/query', req => query(req.queryString.q));
app.get('/download', req => download(req.queryString.id));
app.get('/status', req => status(req.queryString.downloadId));

module.exports = app;
