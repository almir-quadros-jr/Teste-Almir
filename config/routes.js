const express = require('express')
const routes = express.Router()

let db = []

// # Reset state before starting tests
routes.post('/reset', (req, res) => {
    reset()
    return res.status(200).end('OK')
})

routes.get('/balance', (req, res) => {
    var account_id = req.query.account_id

    if (accountCheck(account_id)){
        //# Get balance for existing account
        return res.status(200).end(selecionaRegistro(account_id)[0].balance.toString())
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
        deposit(destination_id, amount)
        registro1 = selecionaRegistro(destination_id)
        retorno = {"destination" : {"id":registro1[0].id, "balance":registro1[0].balance}}
        return res.status(201).end(JSON.stringify(retorno)) 
    } else if (type === "withdraw"){
        if (accountCheck(origin_id)){
            // # Withdraw from existing account
            if (withdraw(origin_id, amount)){  
                registro1 = selecionaRegistro(origin_id)
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
        if (accountCheck(origin_id)){
            // Checa se existe saldo na conta de origem. Existindo, faz a retirada e então o depósito no destino:
            if (withdraw(origin_id, amount)){ 
                // # Transfer from existing account
                deposit(destination_id, amount)
                registro1 = selecionaRegistro(origin_id)
                registro2 = selecionaRegistro(destination_id)
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

function reset(){
    db = []
    return
}

function selecionaRegistro(id){
    let registroSelecionado = []
    registroSelecionado = db.filter(contas => contas.id == id);
    return registroSelecionado
}

function accountCheck(id){
    let check_db = []
    check_db = db.filter(contas => contas.id == id);
    if (check_db.length == 0){
        return false 
    } else {
        return true 
    }
}

function deposit (id, amount){
    if (accountCheck(id)){
        //# Deposit into existing account
        for (var i = 0; i < db.length; i++) {
            if (db[i].id === id) {
                db[i].balance = db[i].balance + amount;
                break;
            }
        } 
    } else {
        //# Create account with initial balance
        db.push({"id":id, "balance":amount})
    }

    return
}

function withdraw (id, amount){
    var sucesso = false

    for (var i = 0; i < db.length; i++) {
        if (db[i].id === id) {
            if (db[i].balance - amount >= 0){
                db[i].balance = db[i].balance - amount;
                sucesso = true
            }
          break;
        }
    }

    return sucesso
}

module.exports = routes