const { Client } = require('pg');
const banco = require('../funcoes/variaveis').banco;

class usuarioDAO{
    // Objeto de acesso aos dados do usuario
    constructor(){
        // Conexão ao banco de dados
        this.client = new Client({
            user: banco.user,
            host: banco.host,
            database: banco.database,
            password: banco.password,
            port: banco.port
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

    async set_imagem(cpf, img){
        // Seta a imagem de perfil do usuario
        var old_image = await this.get_imagem(cpf);
        if(old_image != undefined){
            const query = 'UPDATE usuario_imagem set imagem = $1 where usuario_cpf = $2';
            const values = [img, cpf];
            const result = await this.client.query(query, values);
            return result;
        }
        else{
            const query = 'INSERT INTO usuario_imagem (usuario_cpf, imagem) VALUES ($1, $2)';
            const values = [cpf, img];
            const result = await this.client.query(query, values);
            return result;
        }
    }

    async get_imagem(cpf){
        // Retorna a imagem do usuario
        if(cpf == undefined){
            return;
        }
        const result = await this.client.query(`select i.imagem from usuario_imagem i where i.usuario_cpf = '${cpf}'`);
        return result.rows[0];
    }

    async cadastrar(cpf, senha, nome, foto, end, email){
        // Tenta cadastrar tal usuario no banco, caso já não exista
        const check = await this.consultar_dados(cpf);
        var telefone = undefined;
        if(check.length == 0){
            const ad = await this.client.query(`insert into usuario values('${cpf}', '${nome}', '${email}', '${senha}', 
            '${end}', '${telefone}')`);
            const ad2 = await this.set_imagem(cpf, foto);
            return true;
        }
        return false;
    }

    async check_email(email){
        // Verifica se tal email existe no sistema
        const result = await this.client.query(`select * from usuario where email = '${email}'`);
        if(result.rows.lenght == 0){
            return false;
        }
        return true;
    }

    async redefinirSenha(email, nova_senha){
        // Redefine a senha do usuario e retorna se o procedimento foi executado
        if(this.check_email(email)){
            const result = await this.client.query(`update usuario set senha = '${nova_senha}' where email = '${email}'`);
            return true;
        }
        return false;
    }
}

module.exports = usuarioDAO;
