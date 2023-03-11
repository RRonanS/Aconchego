const { Client } = require('pg');

class usuarioDAO{
    // Objeto de acesso aos dados do usuario
    constructor(){
        // Conexão ao banco de dados
        /*this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: '',
            password: '',
            port: 5432
        });

        client.connect(function(err) {
        if (err) throw err;
        console.log("UsuarioDAO conectado ao banco de dados");
        });*/
    }

    logar(cpf, senha){
        // Verifica se as credenciais sao validas
        return true;
    }
    consultar_dados(cpf){
        // Retorna os dados do usuario
    }
}

module.exports = usuarioDAO;
