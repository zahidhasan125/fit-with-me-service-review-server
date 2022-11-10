const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.voxvdqi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db("serviceReviews").collection("serviceCollections");
        const reviewsCollection = client.db("serviceReviews").collection("reviewCollections");

        async function verifyJWT(req, res, next) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(403).send({ message: "Forbidden Access" })
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: "Unauthorized Access" });
                }
                req.decoded = decoded;
                next()
            })
        }

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
            res.send({ token })
        })

        app.post('/addservice', verifyJWT, async (req, res) => {
            const newService = req.body;
            const serviceWithTime = { ...newService, "date": new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })};
            const result = await serviceCollection.insertOne(serviceWithTime);
            res.send(result);

        })
        app.get('/services', async (req, res) => {
            const query = {};
            const options = { sort: { date: -1 } }
            const services = await serviceCollection.find(query, options).limit(3).toArray()
            res.send(services);

        })
        app.get('/allservices', async (req, res) => {
            const query = {};
            const options = { sort: { date: -1 } }
            const allServices = await serviceCollection.find(query, options).toArray();
            res.send(allServices);

        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);

        })

        app.post('/submitreview', verifyJWT, async (req, res) => {
            const reviewItem = req.body;
            const result = await reviewsCollection.insertOne(reviewItem);
            res.send(result);
        })

        app.get('/reviews/:id', async (req, res) => {
            const serviceId = req.params.id;
            const query = { serviceId: { $eq: serviceId } };
            const options = { sort: { time: -1 } }
            const reviews = await reviewsCollection.find(query, options).toArray();
            res.send(reviews)
        })

        app.get('/myreviews', verifyJWT, async (req, res) => {
            const userEmail = req.query.userEmail;
            const query = { userEmail: { $eq: userEmail } };
            const userReviews = await reviewsCollection.find(query).toArray();
            res.send(userReviews)
        })

        // delete review by reviewId

        app.delete('/myreviews', async (req, res) => {
            const reviewId = req.query.reviewId;
            const query = { _id: ObjectId(reviewId) }
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
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