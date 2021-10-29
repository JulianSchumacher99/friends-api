import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDatabase } from './utils/database';
import { getCharactersCollection } from './utils/database';

if (!process.env.MONGODB_URI) {
  throw new Error('No MONGODB_URI provided');
}

const app = express();
const port = 3000;

// Custom middleware to log requests
app.use((request, _response, next) => {
  console.log('Request received', request.url);
  next();
});

// Middleware for parsing application/json
app.use(express.json());

app.post('/api/characters', async (request, response) => {
  const charactersCollection = getCharactersCollection();
  const newCharacter = request.body;
  const isCharacterKnown = await charactersCollection.findOne({
    name: newCharacter.name,
  });
  if (isCharacterKnown) {
    response
      .status(409)
      .send(`Character ${newCharacter.name} is already there.`);
  } else {
    charactersCollection.insertOne(newCharacter);
    response.send(`Character ${newCharacter.name} has been added.`);
  }
});

app.get('/api/characters/:name', async (request, response) => {
  const charactersCollection = getCharactersCollection();
  const character = request.params.name;
  const characterRequest = await charactersCollection.findOne({
    name: character,
  });
  if (!characterRequest) {
    response.status(404).send('Character not found');
  } else {
    response.send(characterRequest);
  }
});

app.get('/', (_req, res) => {
  res.send('Welcome to the FRIENDS API');
});

connectDatabase(process.env.MONGODB_URI).then(() =>
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
);
