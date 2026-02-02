import AWS from 'aws-sdk';

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  region: process.env.DO_SPACES_REGION || 'atl1',
  s3ForcePathStyle: false,
  signatureVersion: 'v4'
});

export default s3;
