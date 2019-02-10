const stream = require('stream');
const ytdl = require('ytdl-core');
const uuidv4 = require('uuid/v4');

const rp = require('request-promise');
const $ = require('cheerio');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const { S3_BUCKET, SERVER_URL, LAMBDA_URL, LAMBDA_NAME, LAMBDA_PROTOCOL } = require('./env.js');

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

const uploadStream = fileName => {
  const pass = new stream.PassThrough();
  return {
    stream: pass,
    promise: s3Upload({ fileName, fileContent: pass }),
  };
};

const download = async id => {
  const uuid = uuidv4();
  const videoID = `${SERVER_URL}/watch?v=${id}`;
  await s3Upload({ fileName: `touch-${uuid}`, fileContent: 'pending' });

  const { stream, promise } = uploadStream(`file-${uuid}`);
  ytdl(videoID, { quality: 'highestaudio', filter: 'audioonly' }).pipe(stream);
  promise.then(params => {
    console.log(`Finisehd, uuid: ${uuid}, data: ${JSON.stringify(params)}`);
  });

  return { downloadId: uuid };
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