// Variaveis do sistema
const porta = 8080;
const end = "localhost:"+porta;
const email = { 
        endereco: "aconchego_recovery@hotmail.com",
        senha: "aconchego123456",
        service: "hotmail"
}
const banco = {
    user: 'postgres',
    host: 'localhost',
    database: 'aconchego',
    password: 'ultimoreino',
    port: 5432
}

module.exports.porta = porta;
module.exports.endereco = end;
module.exports.email = email;
module.exports.banco = banco;
