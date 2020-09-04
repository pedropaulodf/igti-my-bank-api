import express from 'express';
import { clientsRouter } from './routes/clientsRouter.js'
import { db } from './models/index.js'

// nodemon -r dotenv/config app.js
console.log(db.port);
console.log(db.name);
console.log(db.user);
console.log(db.password);

// Conexão com o Mongo DB
(async () => {
    try {
        db.mongoose.connect("mongodb+srv://"+db.user+":"+db.password+"@bootcamp.kwm4e.gcp.mongodb.net/"+db.name+"?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });

        console.log("Conectado ao Mongo DB Atlas");

    } catch (error) {
        console.log("Erro ao conectar ao Mongo DB Atlas" + error);
    }
})();


// Inicia o Express
const app = express();
app.use(express.json());

// Pega a rota do Students 
app.use(clientsRouter);

// Iniciar o server
app.listen(db.port, () => {
    console.log("API Iniciadda");
})