const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());

// fitnessUserdb:3vavz8IXRXJpA0ZE


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.voxvdqi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("serviceReviews").collection("serviceCollections");
        const reviewCollection = client.db("serviceReviews").collection("reviewCollections");

        app.get('/service', async(req, res) => {
            const query = {};
            

        })

    }
    finally {
        
    }
}
run().catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send("Service Review Server is Running")
})

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
})