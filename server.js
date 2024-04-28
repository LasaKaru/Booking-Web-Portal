require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Importing Express framework
const bodyParser = require('body-parser'); // Importing bodyParser for parsing request bodies
const axios = require('axios'); // Importing axios for making HTTP requests
const authenticate = require('./src/authenticate'); // Importing the authenticate function

const app = express(); // Creating an Express application
const port = process.env.PORT || 8090; // Setting the port to listen on, defaults to 8080

app.use(bodyParser.json()); // Adding middleware to parse JSON requests

// Function to get access token using authentication function
async function getAccessToken() {
    const tokenUrl = process.env.APPOINTMENTS_OAUTH_TOKEN_URL; // Retrieving token URL from environment variables
    const clientId = process.env.APPOINTMENTS_OAUTH_CLIENT_ID; // Retrieving client ID from environment variables
    const clientSecret = process.env.APPOINTMENTS_OAUTH_CLIENT_SECRET; // Retrieving client secret from environment variables

    try {
        const accessToken = await authenticate(tokenUrl, clientId, clientSecret); // Calling the authenticate function to get access token
        return accessToken; // Returning the obtained access token
    } catch (error) {
        console.error('Error obtaining access token:', error); // Logging error if access token retrieval fails
        throw error; // Rethrow the error to handle it in the calling context
    }
}

// Endpoint to get appointments, filtering by email
app.get('/appointments', async (req, res) => {
    try {
        const email = req.query.email; // Retrieving email query parameter from request
        if (!email) {
            return res.status(400).send('Email query parameter is required'); // Sending 400 Bad Request if email is not provided
        }

        const accessToken = await getAccessToken(); // Calling the function to get access token

        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL; // Retrieving appointment service URL from environment variables
        const response = await axios.get(`${appointmentServiceUrl}/appointments?email=${email}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Adding Authorization header with access token
            },
        });

        res.status(response.status).send(response.data); // Sending the fetched appointments as response
    } catch (error) {
        console.error('Error fetching Bookings:', error); // Logging error if fetching appointments fails
        res.status(error.response ? error.response.status : 500).send(error.message); // Sending appropriate error response
    }
});

// Endpoint to create a new appointment
app.post('/create-appointment', async (req, res) => {
    try {
        const accessToken = await getAccessToken(); // Calling the function to get access token

        const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL; // Retrieving appointment service URL from environment variables
        if (!appointmentServiceUrl) {
            throw new Error('Rides Booking service URL is not defined in the environment variables'); // Throwing error if service URL is not defined
        }

        const response = await axios.post(`${appointmentServiceUrl}/appointments`, req.body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Adding Authorization header with access token
            },
        });

        res.status(response.status).send(response.data); // Sending the response from appointment service as response
    } catch (error) {
        console.error('Error forwarding Bookings creation request:', error); // Logging error if creating appointment fails
        res.status(error.response ? error.response.status : 500).send(error.message); // Sending appropriate error response
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`); // Logging a message when server starts listening on the specified port
});
