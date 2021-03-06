// this is just documentation of what env variables are required to run properly

const S3_BUCKET = process.env.S3_BUCKET;
const SERVER_URL = process.env.SERVER_URL;
const LAMBDA_URL = process.env.LAMBDA_URL;
const LAMBDA_NAME = process.env.LAMBDA_NAME;
const LAMBDA_PROTOCOL = process.env.LAMBDA_PROTOCOL;
const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE;
const SECRET = process.env.SECRET;
const DOWNLOAD_URL = process.env.DOWNLOAD_URL;

module.exports = { S3_BUCKET, SERVER_URL, LAMBDA_URL, LAMBDA_NAME, LAMBDA_PROTOCOL, WELCOME_MESSAGE, SECRET, DOWNLOAD_URL };
