const { Client } = require('pg');
const banco = require('../funcoes/variaveis').banco;

class atendimentoDAO{
    // Classe responsável por acessar dados referentes a atendimentos, agendamentos e etc
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
    async get_pacientes(cpf){
        // Retorna a lista de pacientes do profissional(Lembrar de pegar tambem as fotos e outros dados necessarios na consulta ao banco)
    }
    async criar_atendimento(cpf_profissional, cpf_paciente, data, tipo){
        // Cria um novo atendimento
    }
    async get_consultas(cpf_paciente){
        // Retorna a lista de consultas desse paciente
    }
    async gravar_anotacoes(id_atendimento){
        // Grava as anotacoes do profissional dado tal atendimento
    }
    async get_atendimentos(cpf_profissional, mostrar_finalizados=false, apenas_finalizados=false){
        // Retorna todos atendimentos do profissional, com os filtros de que se deve mostrar atendimentos ja finalizados e se apenas eles
    }
    async get_status(id_atendimento){
        // Retorna o status de determinado atendimento
    }
    async set_status(id_atendimento){
        // Seta o status do atendimento(Escolha inteiros para representar os possiveis estados) 
    }
}