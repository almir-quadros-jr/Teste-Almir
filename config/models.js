let db = []

var reset = function(){
    db = []
    return
}

var selecionaRegistro = function(id){
    let registroSelecionado = []
    registroSelecionado = db.filter(contas => contas.id == id);
    return registroSelecionado
}

var accountCheck = function(id){
    let check_db = []
    check_db = db.filter(contas => contas.id == id);
    if (check_db.length == 0){
        return false 
    } else {
        return true 
    }
}

var deposit = function(id, amount){
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

var withdraw = function(id, amount){
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

module.exports = {reset,selecionaRegistro,accountCheck,deposit,withdraw}