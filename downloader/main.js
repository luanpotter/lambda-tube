const stream = require('stream');
const ytdl = require('ytdl-core');

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const s3Upload = ({ bucket, fileName, fileContent }) => s3.upload({ Bucket: bucket, Key: fileName, Body: fileContent, ACL: 'public-read' }).promise();

const uploadStream = ({ bucket, fileName }) => {
    const pass = new stream.PassThrough();
    return {
        stream: pass,
        promise: s3Upload({ bucket, fileName, fileContent: pass }),
    };
};

const download = async ({ bucket, videoUrl, uuid }) => {
    const { stream, promise } = uploadStream({ bucket, fileName: `file-${uuid}` });
    ytdl(videoUrl, { quality: 'highestaudio', filter: 'audioonly' }).pipe(stream);
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