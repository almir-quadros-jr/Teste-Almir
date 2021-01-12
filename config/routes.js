const express = require('express')
const models = require('./models')
const routes = express.Router()

// # Reset state before starting tests
routes.post('/reset', (req, res) => {
    models.reset()
    return res.status(200).end('OK')
})

routes.get('/balance', (req, res) => {
    var account_id = req.query.account_id

    if (models.accountCheck(account_id)){
        //# Get balance for existing account
        return res.status(200).end(models.selecionaRegistro(account_id)[0].balance.toString())
    } else {
        //# Get balance for non-existing account
        return res.status(404).end('0') 
    }
})

routes.post('/event', (req, res) => {
    const body = req.body
    var destination_id = body.destination
    var origin_id = body.origin
    var amount = body.amount
    var type = body.type
    let registro1 = []
    let registro2 = []    
    var retorno = []    

    if (type === "deposit"){
        models.deposit(destination_id, amount)
        registro1 = models.selecionaRegistro(destination_id)
        retorno = {"destination" : {"id":registro1[0].id, "balance":registro1[0].balance}}
        return res.status(201).end(JSON.stringify(retorno)) 
    } else if (type === "withdraw"){
        if (models.accountCheck(origin_id)){
            // # Withdraw from existing account
            if (models.withdraw(origin_id, amount)){  
                registro1 = models.selecionaRegistro(origin_id)
                retorno = {"origin" : {"id":registro1[0].id, "balance":registro1[0].balance}}
                return res.status(201).end(JSON.stringify(retorno)) 
            } else {
                return res.status(404).end('Saldo insuficente para a operação.') 
            }
        } 
        else {
            //# Withdraw from non-existing account
            return res.status(404).end('0') 
        }

    } else if (type === "transfer") {
        // Checa se a conta de de origem existe:
        if (models.accountCheck(origin_id)){
            // Checa se existe saldo na conta de origem. Existindo, faz a retirada e então o depósito no destino:
            if (models.withdraw(origin_id, amount)){ 
                // # Transfer from existing account
                models.deposit(destination_id, amount)
                registro1 = models.selecionaRegistro(origin_id)
                registro2 = models.selecionaRegistro(destination_id)
                retorno = {"origin" : {"id":registro1[0].id, "balance":registro1[0].balance},"destination" : {"id":registro2[0].id, "balance":registro2[0].balance}}
                return res.status(201).end(JSON.stringify(retorno)) 
            } else {
                return res.status(404).end('Saldo insuficente para a operação.')  
            }           
        } else {
            // # Transfer from non-existing account
            return res.status(404).end('0')  
        }
    }
})

module.exports = routes