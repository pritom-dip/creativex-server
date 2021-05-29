const express = require('express')
const app = express();
const cors = require('cors');
const fileUpload = require('express-fileupload');
const port = 4242;
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wrvum.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const adminsCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
    const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("services");
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
    const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
    const ContactCollection = client.db(`${process.env.DB_NAME}`).collection("contacts");

    app.get('/admins', (req, res) => {
        const email = req.query.email;
        let filter = {};
        if (email) {
            filter = { email: email };
        }
        adminsCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addAdmin', (req, res) => {
        const data = req.body;

        adminsCollection.insertOne(data)
            .then(result => {
                res.send({ response: result.insertedCount > 0 })
            });
    });

    app.post('/addService', (req, res) => {
        const data = req.body;
        const { name, desc, price } = data;
        const file = req.files.file;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ name, desc, price, image })
            .then(result => {
                res.send({ response: result.insertedCount > 0 });
            })
    });

    app.get('/services', (req, res) => {
        serviceCollection.find()
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    });

    app.get('/service/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection.find({ _id: id })
            .toArray((err, documents) => {
                if (documents.length > 0) {
                    res.status(200).send(documents[0]);
                }
            })
    });

    app.delete('/service/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        serviceCollection.deleteOne({ _id: id })
            .then(result => {
                res.status(200).send({ response: result.deletedCount > 0 });
            })
    });

    app.post('/addReview', (req, res) => {
        const data = req.body;
        reviewCollection.insertOne(data)
            .then(result => {
                res.status(200).send({ response: result.insertedCount > 0 });
            })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find().sort({ _id: -1 })
            .toArray((err, documents) => {
                res.status(200).send(documents);
            })
    });

    app.post('/addOrder', (req, res) => {
        const data = req.body;
        orderCollection.insertOne(data)
            .then(result => {
                res.send({ response: result.insertedCount > 0 });
            })
    });

    app.get('/orders', (req, res) => {
        const email = req.query.email;
        adminsCollection.find({ email: email })
            .toArray((err, admins) => {
                let filter = {};
                if (admins.length === 0) {
                    filter.email = email;
                }
                orderCollection.find(filter)
                    .toArray((error, documents) => {
                        res.send(documents);
                    });
            });

    });

    app.patch('/updateOrder/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        orderCollection.updateOne(
            { _id: id },
            {
                $set: {
                    status: req.body.status
                }
            })
            .then(result => {
                res.send({ response: result.modifiedCount > 0 });
            })
    });

    app.get('/isAdmin', (req, res) => {
        const email = req.query.email;
        adminsCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send({ length: documents.length })
            })
    });

    app.post('/addContact', (req, res) => {
        const data = req.body;
        ContactCollection.insertOne(data)
            .then(result => {
                res.send({ response: result.insertedCount > 0 });
            })
    });

});

app.get('/', (req, res) => {
    res.send('Hello World From agency server!')
})

app.listen(process.env.PORT || port);