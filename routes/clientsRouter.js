import express from 'express'
import controllerClients from '../controllers/clientsController.js'

const app = express();

// QUESTÃO 4
app.put('/deposito/:agencia/:conta/:balance', controllerClients.deposito);

// QUESTÃO 5
app.put('/saque/:agencia/:conta/:balance', controllerClients.saque);

// QUESTÃO 6
app.get('/saldo/:agencia/:conta', controllerClients.saldo);

// QUESTÃO 7
app.delete('/excluir-conta/:agencia/:conta', controllerClients.excluirConta);

// QUESTÃO 8
app.put('/transferencia/:ccorigem/:ccdestino/:valor', controllerClients.transferencia);

// QUESTÃO 9
app.get('/media-saldo/:agencia', controllerClients.mediaSaldo);

// QUESTÃO 10
app.get('/menores-saldos/:qtt', controllerClients.menoresSaldos);

// QUESTÃO 11
app.get('/maiores-saldos/:qtt', controllerClients.maioresSaldos);

// QUESTÃO 12
app.put('/transfer-private/', controllerClients.tranferPrivate);


// Exporta a rota para o App.js
export { app as clientsRouter };