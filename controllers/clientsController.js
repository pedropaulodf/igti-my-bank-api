import { db } from '../models/index.js'

const ClientsAccounts = db.clientsAccountsModel;

/**
    4. Crie um endpoint para registrar um depósito em uma conta. Este endpoint deverá
    receber como parâmetros a “agencia”, o número da “conta” e o valor do depósito.
    Ele deverá atualizar o “balance” da conta, incrementando-o com o valor recebido
    como parâmetro. O endpoint deverá validar se a conta informada existe, caso não
    exista deverá retornar um erro, caso exista retornar o saldo atual da conta. 
 */

function validaBalance(val) {
    const valor = parseInt(val);
    if (valor <= 0) {
        throw new Error('O valor em dinheiro informado para a transação é inválido!');
    }
}

const deposito = async (req, res) => {
    try {
        const { agencia, conta, balance } = req.params;

        validaBalance(balance);

        // Incrementa o valor do balance
        const data = await ClientsAccounts.updateOne({ agencia: agencia, conta: conta }, { $inc: { balance: balance } });

        if (!data) {
            res.status(404).send("Conta inexistente no Banco de dados!");
        }

        // Mostra a conta atualizada
        const updatedClient = await ClientsAccounts.findOne({ agencia: agencia, conta: conta }, { _id: 0 });

        // Retorna o valor do balance
        res.send(updatedClient);

    } catch (error) {
        res.status(500).send("Erro ao atualizar o Estudante. Erro: " + error);
    }
}

/**
    5. Crie um endpoint para registrar um saque em uma conta. Este endpoint deverá
    receber como parâmetros a “agência”, o número da “conta” e o valor do saque. Ele
    deverá atualizar o “balance” da conta, decrementando-o com o valor recebido com
    parâmetro e cobrando uma tarifa de saque de (1). O endpoint deverá validar se a
    conta informada existe, caso não exista deverá retornar um erro, caso exista retornar
    o saldo atual da conta. Também deverá validar se a conta possui saldo suficiente
    para aquele saque, se não tiver deverá retornar um erro, não permitindo assim que
    o saque fique negativo.
 */

const saque = async (req, res) => {
    try {
        let { agencia, conta, balance } = req.params;

        validaBalance(balance);

        balance = parseInt(balance) + 1;

        // Mostra a conta atualizada
        const clienteAccount = await ClientsAccounts.findOne({ agencia: agencia, conta: conta }, { balance: 1, _id: 0 });

        if (!clienteAccount) {
            res.status(404).send("Conta inexistente no Banco de dados!");
        }

        // Verifica se o saldo atual permite o saque desejado
        const saldoAposSaque = parseInt(clienteAccount.balance) - balance;

        // Se não permitir, bloqueia o saque
        if (saldoAposSaque < 0) {
            throw new Error('Saldo indisponível para o saque. Saldo atual R$ ' + clienteAccount.balance + ' reais.');
        }

        // Decrementa o valor do balance
        await ClientsAccounts.updateOne({ agencia: agencia, conta: conta }, { $inc: { balance: -balance } });

        // Mostra a conta atualizada
        const updatedClient = await ClientsAccounts.findOne({ agencia: agencia, conta: conta }, { _id: 0 });

        // Retorna o valor do balance
        res.send(updatedClient);

    } catch (error) {
        res.status(500).send("Erro ao realizar o saque. " + error);
    }
}

/**
    6. Crie um endpoint para consultar o saldo da conta. Este endpoint deverá receber
    como parâmetro a “agência” e o número da “conta”, e deverá retornar seu “balance”.
    Caso a conta informada não exista, retornar um erro.
 */

const saldo = async (req, res) => {
    try {
        const { agencia, conta } = req.params;

        // Mostra a conta buscada
        const data = await ClientsAccounts.findOne({ agencia: agencia, conta: conta }, { _id: 0 });

        if (!data) {
            res.status(404).send("Conta inexistente no Banco de dados!");
        }

        // Retorna o valor do balance
        res.send(data);

    } catch (error) {
        res.status(500).send("Erro ao realizar o saque. " + error);
    }
}

/**
    7. Crie um endpoint para excluir uma conta. Este endpoint deverá receber como
    parâmetro a “agência” e o número da “conta” da conta e retornar o número de contas
    ativas para esta agência.
 */

const excluirConta = async (req, res) => {
    try {
        const { agencia, conta } = req.params;

        // Mostra a conta buscada
        const data = await ClientsAccounts.findOne({ agencia: agencia, conta: conta }, { _id: 1 });

        if (!data) {
            res.status(404).send("Conta inexistente no Banco de dados!");
        }
        await ClientsAccounts.findByIdAndRemove({ _id: data._id });


        // Mostra a conta buscada
        const contasRestantesAgencia = await ClientsAccounts.find({ agencia: agencia }, { agencia: 1, conta: 1, name: 1, balance: 1, _id: 0 });

        console.log("Restaram: " + contasRestantesAgencia.length + " contas.");

        // Retorna o valor do balance
        res.send("Conta excluída com sucesso! Restaram: " + contasRestantesAgencia.length + " contas.");

    } catch (error) {
        res.status(500).send("Erro ao realizar o saque. " + error);
    }
}

/**
    8. Crie um endpoint para realizar transferências entre contas. Este endpoint deverá
    receber como parâmetro o número da “conta” origem, o número da “conta” destino e
    o valor de transferência. Este endpoint deve validar se as contas são da mesma
    agência para realizar a transferência, caso seja de agências distintas o valor de tarifa
    de transferencia (8) deve ser debitado na “conta” origem. O endpoint deverá retornar
    o saldo da conta origem.
 */

const transferencia = async (req, res) => {
    try {
        const { ccorigem, ccdestino, valor } = req.params;

        validaBalance(valor);

        const agenciaCcOrigem = await ClientsAccounts.findOne({ conta: ccorigem }, { agencia: 1, balance: 1, _id: 0 });
        const agenciaCcDestino = await ClientsAccounts.findOne({ conta: ccdestino }, { agencia: 1, balance: 1, _id: 0 });

        if (!agenciaCcOrigem || !agenciaCcDestino) {
            res.status(404).send("Conta de Origem ou Destino não encontrado!");
        }

        const fazerTransferencia = async (val, tax = 0) => {

            const valor = parseInt(val);
            const taxa = parseInt(tax);

            const valorComTaxa = parseInt(valor) + taxa;

            // Verifica se o saldo atual permite a transferencia desejada
            const saldoAposTransferencia = parseInt(agenciaCcOrigem.balance) - valorComTaxa;

            // Se não permitir, bloqueia a transferencia
            if (saldoAposTransferencia < 0) {
                throw new Error('Saldo insuficiente na conta de Origem. Saldo atual R$ ' + agenciaCcOrigem.balance + ' reais.');
            }

            // Decrementa o valor do balance da conta Origem
            await ClientsAccounts.updateOne({ conta: ccorigem }, { $inc: { balance: -valorComTaxa } });

            // Incremente o valor do balance da conta Destino
            await ClientsAccounts.updateOne({ conta: ccdestino }, { $inc: { balance: valor } });

            // Pega o valor do saldo atual do conta de Origem
            const saldoContaOrigem = await ClientsAccounts.findOne({ conta: ccorigem }, { balance: 1, _id: 0 });

            // Retorna o saldo atual da conta de origem
            return saldoContaOrigem;
        }

        if (agenciaCcOrigem.agencia === agenciaCcDestino.agencia) {

            const saldoContaOrigem = await fazerTransferencia(valor, 0);
            console.log(saldoContaOrigem);

            // Retorna o valor do balance
            res.send("Transferência realizada com sucesso! Saldo restante: " + saldoContaOrigem.balance);

        } else {

            const saldoContaOrigem = await fazerTransferencia(valor, 8);
            console.log(saldoContaOrigem);

            res.send("Transferência realizada com sucesso! Saldo restante: " + saldoContaOrigem.balance);
        }


    } catch (error) {
        res.status(500).send("Erro ao realizar a transferência. " + error);
    }
}


/**
    9. Crie um endpoint para consultar a média do saldo dos clientes de determinada
    agência. O endpoint deverá receber como parametro a “agência” e deverá retornar
    o balance médio da conta.
 */

const mediaSaldo = async (req, res) => {
    try {
        const { agencia } = req.params;

        // Mostra a conta buscada
        const data = await ClientsAccounts.find({ agencia: agencia, }, { balance: 1, _id: 0 });

        if (!data) {
            res.status(404).send("Conta inexistente no Banco de dados!");
        }

        let totalSaldo = 0;
        for (let i = 0; i < data.length; i++) {
            totalSaldo += data[i].balance;
        }

        console.log("A médio do saldo da agência "+agencia+" é: " + (totalSaldo / data.length).toFixed(2));

        // Retorna o valor do balance
        res.send("A médio do saldo da agência "+agencia+" é: " + (totalSaldo / data.length).toFixed(2));

    } catch (error) {
        res.status(500).send("Erro ao realizar a consulta do saldo. " + error);
    }
}


/**
    10. Crie um endpoint para consultar os clientes com o menor saldo em conta. O endpoint
    devera receber como parâmetro um valor numérico para determinar a quantidade de
    clientes a serem listados, e o endpoint deverá retornar em ordem crescente pelo
    saldo a lista dos clientes (agência, conta, saldo).
 */

const menoresSaldos = async (req, res) => {
    try {
        const { qtt } = req.params;

        // Mostra a conta buscada
        const data = await ClientsAccounts.find({}, { agencia: 1, conta: 1, name: 1, balance: 1, _id: 0 }).sort({ balance: 1 }).limit(parseInt(qtt));

        console.log(data);

        // Retorna o valor do balance
        res.send(data);

    } catch (error) {
        res.status(500).send("Erro ao buscar os menor saldos. " + error);
    }
}

/**
    11. Crie um endpoint para consultar os clientes mais ricos do banco. O endpoint deverá receber como parâmetro um valor numérico para determinar a quantidade de clientes a serem listados, e o endpoint deverá retornar em ordem decrescente pelo saldo, crescente pelo nome, a lista dos clientes (agência, conta, nome e saldo).
 */

const maioresSaldos = async (req, res) => {
    try {
        const { qtt } = req.params;

        // Mostra a conta buscada
        const data = await ClientsAccounts.find({}, { agencia: 1, conta: 1, name: 1, balance: 1, _id: 0 }).sort({ balance: -1 }).limit(parseInt(qtt));

        console.log(data);

        // Retorna o valor do balance
        res.send(data);

    } catch (error) {
        res.status(500).send("Erro ao buscar os maiores saldos. " + error);
    }
}


/**
    12. Crie um endpoint que irá transferir o cliente com maior saldo em conta de cada agência para a agência private agencia=99. O endpoint deverá retornar a lista dos clientes da agencia private.
 */

const tranferPrivate = async (req, res) => {
    try {

        // Mostra a conta buscada
        const data = await ClientsAccounts.distinct("agencia");

        // Remoção do código da agência private
        const agenciasNormais = data.filter(item => item !== 99);

        for (let i = 0; i < agenciasNormais.length; i++) {
            const maiorSaldo = await ClientsAccounts.find({ agencia: agenciasNormais[i] }, { _id: 1, balance: 1 }).sort({ balance: -1 }).limit(1);
            await ClientsAccounts.updateOne({ _id: maiorSaldo[0]._id }, { $set: { agencia: 99 } });
        }

        // Busca os clientes privados
        const clientesPrivados = await ClientsAccounts.find({ agencia: 99 }, { _id: 0 }).sort({ balance: -1 });

        // Retorna o valor do balance
        res.send(clientesPrivados);

    } catch (error) {
        res.status(500).send("Erro ao buscar os maiores saldos. " + error);
    }
}


// export default { create, findAll, findOne, update, remove };
export default { deposito, saque, saldo, excluirConta, mediaSaldo, menoresSaldos, maioresSaldos, tranferPrivate, transferencia };