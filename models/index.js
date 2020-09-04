import mongoose from 'mongoose';

// Importa o modelo da collection student
import clientsAccountsModel from './clientsAccountsModel.js'
 

const db = {};

db.url = process.env.DB_URL;
db.port = process.env.PORT;
// db.url = "mongodb://localhost:27017/grades";
db.mongoose = mongoose;
db.clientsAccountsModel = clientsAccountsModel(mongoose);

export { db };