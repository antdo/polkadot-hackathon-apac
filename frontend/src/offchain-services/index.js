const UPLOAD_FILE_ENDPOINT =
  'https://d4zbx7onsk.execute-api.us-east-1.amazonaws.com/dev/upload';

export default {
  uploadImage({ key, base64, contentType }) {
    return fetch(UPLOAD_FILE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key,
        base64: base64.split('base64,')[1],
        contentType,
      }),
    }).then(response => response.json());
  },
};
