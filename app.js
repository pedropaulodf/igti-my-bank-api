import express from 'express';
import { clientsRouter } from './routes/clientsRouter.js'
import { db } from './models/index.js'

// nodemon -r dotenv/config app.js
console.log(db.url);

// Conexão com o Mongo DB
(async () => {
    try {
        db.mongoose.connect(db.url, {
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
app.listen(3000, () => {
    console.log("API Iniciadda");
})