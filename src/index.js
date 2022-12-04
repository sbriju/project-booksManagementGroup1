const express = require('express');
const mongoose = require('mongoose');
const route = require('./routes/route');
const app = express();

app.use(express.json());

mongoose.connect('mongodb+srv://vs401716:vs401716@cluster1.u3fgp6r.mongodb.net/project-booksManagementGroup1', {
    useNewUrlParser: true
})
    .then(() => console.log('MongoDb is connected.'))
    .catch(err => console.log(err));

app.use('/', route);

app.use((req, res) => res.status(400).send({ status: false, message: 'Invalid URL' }));
app.listen(3000, () => console.log('Express app is running on port 3000.'));
