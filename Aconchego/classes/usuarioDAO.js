const { Client } = require('pg');

class usuarioDAO{
    // Objeto de acesso aos dados do usuario
    constructor(){
        // Conexão ao banco de dados
        this.client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'aconchego',
            password: 'ultimoreino',
            port: 5432
        });

        this.client.connect(function(err) {
        if (err) throw err;
        console.log("UsuarioDAO conectado ao banco de dados");
        });
    }

    async logar(cpf, senha){
        // Verifica se as credenciais sao validas
        const dados = await this.client.query(`SELECT * FROM usuario WHERE cpf = '${cpf}' and senha = '${senha}'`);
        if(dados.rows.length == 0){
            return false;
        }
        return true;
    }
    async consultar_dados(cpf){
        // Retorna os dados gerais do usuario
        const result = await this.client.query(`SELECT * FROM usuario WHERE cpf = ${cpf}`);
        console.log(result.rows);
        return result.rows;
    }

    async get_perfil(cpf){
        // Retorna o perfil do usuario
        const result = await this.client.query(`SELECT u.cpf, 
        a.cpf AS administrador_cpf, 
        p.cpf AS paciente_cpf, 
        pr.cpf AS profissional_cpf, 
        pa.cpf AS padrinho_cpf
        FROM usuario u
        LEFT JOIN administrador a ON u.cpf = a.cpf
        LEFT JOIN paciente p ON u.cpf = p.cpf
        LEFT JOIN profissional pr ON u.cpf = pr.cpf
        LEFT JOIN padrinho pa ON u.cpf = pa.cpf
        WHERE u.cpf = '${cpf}';`);
        var dados = result.rows[0];
        if(dados.administrador_cpf != null){
            return 'administrador';
        }
        if(dados.profssional_cpf != null){
            return 'profissional';
        }
        if(dados.padrinho_cpf != null){
            return 'padrinho';
        }
        if(dados.paciente_cpf != null){
            return 'paciente';
        }
        return undefined;
    }
    
    async get_nome(cpf){
        // Retorna o nome do usuario
        const result = await this.consultar_dados(cpf);
        if(result.lenght == 0){
            return undefined
        }
        return result[0].nome;
    }

}

module.exports = usuarioDAO;
