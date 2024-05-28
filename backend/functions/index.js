const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const validateFirebaseIdToken = async (req, res, next) => {
    functions.logger.log('Check if request is authorized with Firebase ID token');

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)) {
        functions.logger.error(
            'No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.'
        );
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        functions.logger.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    }  else {
        // No cookie
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log('ID Token correctly decoded', decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (error) {
        functions.logger.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    }
};

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(validateFirebaseIdToken);


// Routes
app.post('/events', async (req, res) => {
    const { start, end, admin_id, event_id } = req.body;

    const eventsRef = db.collection('events');
    const overlappingEvents = await eventsRef
        .where('admin_id', '==', admin_id)
        .where('start', '<', end)
        .where('end', '>', start)
        .get();

    if (!overlappingEvents.empty) {
        return res.status(400).send({ error: 'Event time overlaps with an existing event' });
    }

    try {
        await eventsRef.doc(event_id.toString()).set(req.body);
        res.status(201).send(req.body);
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get('/events/:start/:end', async (req, res) => {
    try {
        const eventsRef = db.collection('events');
        const eventsSnapshot = await eventsRef
            .where('start', '>=', req.params.start)
            .where('end', '<=', req.params.end)
            .get();

        const events = eventsSnapshot.docs.map(doc => doc.data());

        res.status(200).send(events);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/events/:event_id', async (req, res) => {
    try {
        const eventDoc = await db.collection('events').doc(req.params.event_id).get();
        if (!eventDoc.exists) {
            return res.status(404).send();
        }
        res.status(200).send(eventDoc.data());
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/events/:event_id', async (req, res) => {
    const { start, end, admin_id } = req.body;
    const event_id = req.params.event_id;

    const eventsRef = db.collection('events');
    const overlappingEvents = await eventsRef
        .where('admin_id', '==', admin_id)
        .where('start', '<', end)
        .where('end', '>', start)
        .get();


    let hasOverlap = false;
    overlappingEvents.forEach(doc => {
        if (doc.id !== event_id) {
            hasOverlap = true;
        }
    });

    if (hasOverlap) {
        return res.status(400).send({ error: 'Event time overlaps with an existing event' });
    }


    try {
        const eventDoc = eventsRef.doc(event_id);
        await eventDoc.update(req.body);
        const updatedEvent = await eventDoc.get();
        res.status(200).send(updatedEvent.data());
    } catch (error) {
        res.status(400).send(error);
    }
});

app.delete('/events/:event_id', async (req, res) => {
    try {
        const eventDoc = db.collection('events').doc(req.params.event_id);
        await eventDoc.delete();
        res.status(200).send({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

exports.api = functions.region("asia-south1").https.onRequest(app);
