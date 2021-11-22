const S3 = require('aws-sdk/clients/s3');

const S3_BUCKET = 'hackathon-file-bucket';
const S3_BASE_URL = 'https://hackathon-file-bucket.s3.amazonaws.com'

module.exports.upload = async (event) => {
  const request = JSON.parse(event.body);

  const s3Client = await new S3({
    apiVersion: '2006-03-01',
    maxRetries: 3,
    httpOptions: 3000,
  });

  let isExisted = false;

  try {
    await s3Client.headObject({ Key: request.key, Bucket: S3_BUCKET }).promise();
    isExisted = true;
  } catch (err) {
    console.log('ERR: ', err.message);
    isExisted = false;
  }

  if (isExisted) {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          message: 'File already existed!',
        },  
        null,
        2
      ),
    };
  }

  const data = Buffer.from(request.base64, 'base64');

  try {
    await s3Client.putObject({
      Body: data,
      Bucket: S3_BUCKET,
      Key: request.key,
      ContentType: request.contentType,
      ContentLength: data.byteLength,
    })
    .promise();
  
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          url: `${S3_BASE_URL}/${request.key}`
        },  
        null,
        2
      ),
    };
  } catch (err) {
    console.log('ERROR: ', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: 'Something went wrong!',
        },  
        null,
        2
      ),
    };
  }
};
