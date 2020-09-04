import mongoose from 'mongoose';

// Importa o modelo da collection student
import clientsAccountsModel from './clientsAccountsModel.js'
 

const db = {};

db.url = process.env.DB_URL;
db.port = process.env.PORT;
db.name = process.env.DBNAME;
db.user = process.env.USERDB;
db.password = process.env.PWDDB;
// db.url = "mongodb://localhost:27017/grades";
db.mongoose = mongoose;
db.clientsAccountsModel = clientsAccountsModel(mongoose);

export { db };