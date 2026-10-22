import express from 'express';
import cors from 'cors';
import { MongoClient,ObjectId } from 'mongodb';
// import dotenv from 'dotenv';
// dotenv.config();
// or,uporer 2 line er bodole 1 line use kora jay
import 'dotenv/config'


const app = express();
// middleware->prottekta api call korle ei jinishta active hobe
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// console.log(process.env.DB_USER);,,,check korar jonno

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uaam5id.mongodb.net/`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
//   finally {
//     // await client.close();
//   }
}

// await connectToMongoDB();  //You successfully connected to MongoDB! ,,output terminal a ata dekhabe

const connectedClient = await connectToMongoDB();
const db = connectedClient.db('simple-crud-db');
const users=db.collection('users');

app.get('/', (req, res) => {
  res.send('simple crud operation');
});

app.get('/users', async (req, res) => {
  const cursor = users.find({});
  const allUsers = await cursor.toArray();
  res.send(allUsers);
});

app.get('/users/:id', async (req, res) => {   // : dea mane dynamic route
  console.log('params in the server', req.params);     //ei line diye then http://localhost:5000/users/6ad9141f23705bb21c9a950b ei link a gele terminal a dekhabe je params ki ase,,,,id jekonotay dite pari,,users/ diye id ta likha
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await users.findOne(query);
  res.send(result);   //abr http://localhost:5000/users/6ad9141f23705bb21c9a950b ei link a gele data peye jabo
});

app.post('/users', async (req, res) => {
  const newUser = req.body;
  console.log('Adding new user', newUser);
  const result = await users.insertOne(newUser);
  res.send(result);
});

app.patch('/users/:id', async (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;
  console.log('Updating user with id:', id, 'and data:', updatedUser);    //server side a data asche kina check kore,,terminal dekha jay update hoisekina data
  const filter= { _id: new ObjectId(id) };
  const options = { upsert: true }; // If the document doesn't exist, create a new one
  const updateDoc = {
    $set: {
      name: updatedUser.name,
      email: updatedUser.email,
      // Add other fields you want to update here
    }
  };
  const result = await users.updateOne(filter, updateDoc, options);
  res.send(result);
// database eo data update hoye gese
});

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await users.deleteOne(query);
  res.send(result);
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});