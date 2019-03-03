const stream = require('stream');
const ytdl = require('ytdl-core');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const { ffmpeg } = require('./ffmpeg.js');

const s3Upload = ({ bucket, fileName, fileContent }) => s3.upload({ Bucket: bucket, Key: fileName, Body: fileContent, ACL: 'public-read' }).promise();

const uploadStream = ({ bucket, fileName }) => {
    const pass = new stream.PassThrough();
    return {
        s3Stream: pass,
        promise: s3Upload({ bucket, fileName, fileContent: pass }),
    };
};

const download = async ({ bucket, videoUrl, uuid }) => {
    const { s3Stream, promise } = uploadStream({ bucket, fileName: `file-${uuid}` });

    const ytdlStream = ytdl(videoUrl, { quality: 'highestaudio', filter: 'audioonly' });
    ffmpeg(ytdlStream).inputFormat('webm').noVideo().outputFormat('mp3').writeToStream(s3Stream);

    const result = await promise;
    return `Finisehd, uuid: ${uuid}, data: ${JSON.stringify(result)}`;
};

exports.handler = async (payload) => {
    const { bucket, videoUrl, uuid } = payload;
    console.log(`Running for bucket ${bucket}, videoUrl ${videoUrl} and uuid ${uuid}`);
    const response = await download({ bucket, videoUrl, uuid });
    console.log(response);
    return response;
};

download({ bucket: 'foobar', videoUrl: 'https://www.youtube.com/watch?v=vt1Pwfnh5pc', uuid: 'file-name' });