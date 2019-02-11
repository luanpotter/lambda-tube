const uuidv4 = require('uuid/v4');

const rp = require('request-promise');
const $ = require('cheerio');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const { S3_BUCKET, SERVER_URL, LAMBDA_URL, LAMBDA_NAME, LAMBDA_PROTOCOL, DOWNLOAD_URL } = require('./env.js');

const invokeLambda = args => {
  const lambda = new AWS.Lambda();
  const params = {
    FunctionName: 'lambda-tube-downloader',
    InvocationType: 'Event',
    Payload: JSON.stringify(args),
  };
  return lambda.invoke(params).promise();
};

const queryUrl = param => `${SERVER_URL}/results?search_query=${encodeURIComponent(param)}`;

const normalize = obj => ({
  id: obj.id.split('&')[0].substring('/watch?v='.length),
  title: obj.title,
});

const details = () => ({
  url: LAMBDA_URL,
  name: LAMBDA_NAME,
  protocol: LAMBDA_PROTOCOL,
});

const query = async q => {
  const html = await rp(queryUrl(q));
  const videos = Array.from($('.item-section .yt-lockup-title', html));
  return videos.map(tag => ({
    id: $('a', tag).attr('href'),
    title: $('a > span', tag).text(),
  })).map(normalize);
};

const s3Upload = ({ fileName, fileContent }) => s3.upload({ Bucket: S3_BUCKET, Key: fileName, Body: fileContent, ACL: 'public-read' }).promise();

const download = async id => {
  const uuid = uuidv4();
  const videoUrl = `${SERVER_URL}/watch?v=${id}`;

  await s3Upload({ fileName: `touch-${uuid}`, fileContent: 'pending' });

  const result = await invokeLambda({
    bucket: S3_BUCKET,
    videoUrl,
    uuid,
  });
  console.log(result);

  return { downloadId: uuid, downloadUrl: `${DOWNLOAD_URL}/file-${uuid}` };
};

const tryHead = async file => {
  const params = {
    Bucket: S3_BUCKET,
    Key: file,
  };

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (ex) {
    return false;
  }
};

const status = async downloadId => {
  const done = await tryHead(`file-${downloadId}`);
  if (done) {
    return { status: 'ok' };
  }

  const pending = await tryHead(`touch-${downloadId}`)
  if (pending) {
    return { status: 'pending' };
  }

  return { status: 'not-found' };
};

module.exports = { details, query, download, status };