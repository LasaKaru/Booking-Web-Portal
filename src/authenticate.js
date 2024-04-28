const axios = require('axios'); // Importing the axios library for making HTTP requests

// Function to authenticate using client credentials
const authenticate = async (tokenUrl, clientId, clientSecret) => {
  try {
    // Creating base64-encoded credentials from client ID and client secret
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // Making a POST request to the token URL to obtain access token
    const response = await axios.post(tokenUrl, 'grant_type=client_credentials', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}` // Sending the base64-encoded credentials in the Authorization header
      },
    });

    const { access_token } = response.data; // Extracting access token from response data
    return access_token; // Returning the obtained access token
  } catch (error) {
    console.error('Authentication failed:', error); // Logging error if authentication fails
    throw error; // Throwing error for handling in the calling code
  }
};


module.exports = authenticate; // Exporting the authenticate model
