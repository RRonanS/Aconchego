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
      try {
        const query = `
          SELECT * FROM paciente
          WHERE cpf IN (
            SELECT cpf_paciente FROM atendimento
            WHERE cpf_profissional = $1
          )
        `;
        const values = [cpf];
        const result = await this.client.query(query, values);
        return result.rows;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
    
    async criar_atendimento(cpf_profissional, cpf_paciente, data, tipo){
      // Cria um novo atendimento
      try {
        const query = `INSERT INTO atendimento (cpf_profissional, cpf_paciente, data, tipo) 
                       VALUES ($1, $2, $3, $4) RETURNING id_atendimento`;
        const values = [cpf_profissional, cpf_paciente, data, tipo];
        const result = await this.client.query(query, values);
        const id_atendimento = result.rows[0].id_atendimento;
        console.log(`Atendimento criado com sucesso. ID do atendimento: ${id_atendimento}`);
        return id_atendimento;
      } catch (error) {
        console.error("Erro ao criar atendimento:", error);
        throw error;
      }
    }
    
    async get_consultas(cpf_paciente){
      // Retorna a lista de consultas desse paciente
      try {
        const query = `SELECT * FROM consultas WHERE cpf_paciente = $1`;
        const values = [cpf_paciente];
        const result = await this.client.query(query, values);
        return result.rows;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
    
    async gravar_anotacoes(id_atendimento, anotacoes){
      // Grava as anotacoes do profissional dado tal atendimento
      try {
        await this.client.query('BEGIN');
        const query = `UPDATE atendimento SET anotacoes=$1 WHERE id_atendimento=$2`;
        const values = [anotacoes, id_atendimento];
        await this.client.query(query, values);
        await this.client.query('COMMIT');
      } catch (error) {
        await this.client.query('ROLLBACK');
        throw error;
      }
    }
    
    async get_atendimentos(cpf_profissional, mostrar_finalizados = false, apenas_finalizados = false) {
      // Retorna todos atendimentos do profissional, com os filtros de que se deve mostrar atendimentos ja finalizados e se apenas eles
      try {
        let query = `SELECT * FROM atendimento WHERE cpf_profissional = $1`;
    
        if (apenas_finalizados) {
          query += ` AND status = 'finalizado'`;
        } else if (mostrar_finalizados) {
          query += ` AND (status = 'finalizado' OR status = 'em_andamento')`;
        } else {
          query += ` AND status != 'cancelado'`;
        }
    
        const values = [cpf_profissional];
        const result = await this.client.query(query, values);
    
        return result.rows;
      } catch (error) {
        throw error;
      }
    }
    
    async get_status(id_atendimento){
      // Retorna o status de determinado atendimento
      try {
        const query = `SELECT status FROM atendimento WHERE id_atendimento = $1`;
        const values = [id_atendimento];
        const result = await this.client.query(query, values);
        if (result.rowCount === 0) {
            throw new Error(`Atendimento com id ${id_atendimento} não encontrado`);
        }
        return result.rows[0].status;
      } catch (error) {
        console.error(`Erro ao buscar o status do atendimento com id ${id_atendimento}: ${error}`);
        throw new Error(`Erro ao buscar o status do atendimento com id ${id_atendimento}: ${error}`);
      }
    }
    
    async set_status(id_atendimento, status) {
      // Seta o status do atendimento(Escolha inteiros para representar os possiveis estados) 
      try {
        const query = `UPDATE atendimento SET status = $1 WHERE id_atendimento = $2`;
        const values = [status, id_atendimento];
        const result = await this.client.query(query, values);
        return result.rowCount === 1;
      } catch (err) {
        console.error(`Erro ao atualizar o status do atendimento com id ${id_atendimento}: ${err}`);
        throw new Error(`Erro ao atualizar o status do atendimento com id ${id_atendimento}: ${err}`);
      }
    }
    
    
      
}
