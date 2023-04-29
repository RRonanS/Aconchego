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
        console.log("AtendimentoDAO conectado ao banco de dados");
        });
    }
    async get_pacientes(cpf){
        // Retorna a lista de pacientes do profissional
        try {
          const query = `
            SELECT * FROM usuario left join usuario_imagem on(usuario_cpf = cpf)
            WHERE cpf IN (
              SELECT paciente_cpf FROM atendimento
              WHERE profissional_cpf = $1
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
            const query = `INSERT INTO atendimento (profissional_cpf, paciente_cpf, data_atendimento, tipo) 
                           VALUES ($1, $2, $3, $4) RETURNING id_atendimento`;
            const values = [cpf_profissional, cpf_paciente, data, tipo];
            const result = await this.client.query(query, values);
            const id_atendimento = result.rows[0].id_atendimento;
            console.log(`Atendimento criado com sucesso. ID do atendimento: ${id_atendimento}`);
            return id_atendimento;
        } catch (error) {
            console.error("Erro ao criar atendimento:", error);
        }
    }
    
    async get_consultas_paciente(cpf_paciente, data){
          // Retorna a lista de consultas desse paciente, adicionar data
        try {
            data = data.toISOString();
            const result = await this.client.query(`SELECT * FROM atendimento left join usuario_imagem on(usuario_cpf = profissional_cpf)
            join usuario on(cpf = profissional_cpf)
            WHERE paciente_cpf = '${cpf_paciente}' 
            and data_atendimento >= '${data}'`);
            return result.rows;
        } catch (err) {
            console.error(err);
        }
    }

    async get_consultas_profissional(cpf_profissional, data){
        // Retorna a lista de consultas desse profissional
        try {
          data = data.toISOString();
          const result = await this.client.query(`SELECT * FROM atendimento left join usuario_imagem on(paciente_cpf = usuario_cpf)
          right join usuario on(cpf = paciente_cpf)
          WHERE profissional_cpf = '${cpf_profissional}' 
          and data_atendimento >= '${data}'`);
          return result.rows;
        } catch (err) {
          console.error(err);
       }
    }
    
    async gravar_anotacoes(id_atendimento, anotacoes){
        // Grava as anotacoes do profissional dado tal atendimento
        try {
            await this.client.query('BEGIN');
            const consulta = `UPDATE atendimento SET anotacoes=$1 WHERE id=$2`;
            const values = [anotacoes, id_atendimento];
            await this.client.query(consulta, values);
            await this.client.query('COMMIT');
        } catch (error) {
            await this.client.query('ROLLBACK');
            throw error;
        }
    }
    
    async get_atendimentos(cpf_profissional, mostrar_finalizados = false, apenas_finalizados = false) {
          // Retorna todos atendimentos do profissional, com os filtros de que se deve mostrar atendimentos ja finalizados e se apenas eles
        try {
          await this.client.connect();
      
          let query = `SELECT * FROM atendimento WHERE cpf_profissional = '${cpf_profissional}'`;
      
          if (apenas_finalizados) {
            query += ` AND status = 'finalizado'`;
          } else if (mostrar_finalizados) {
            query += ` AND (status = 'finalizado' OR status = 'em_andamento')`;
          } else {
            query += ` AND status != 'cancelado'`;
          }
      
          const result = await this.client.query(query);
      
          return result.rows;
        } catch (error) {
          throw error;
        } finally {
          await this.client.end();
        }
      }
      
      async get_status(id_atendimento){
         // Retorna o status de determinado atendimento
        try {
            const result = await this.client.query(`SELECT status FROM atendimento WHERE id = $1`, [id_atendimento]);
            if (result.rowCount === 0) {
                throw new Error(`Atendimento com id ${id_atendimento} não encontrado`);
            }
            return result.rows[0].status;
        } catch (error) {
            throw new Error(`Erro ao buscar o status do atendimento com id ${id_atendimento}: ${error.message}`);
        }
    }

    async get_consulta(id){
        // Retorna a consulta dado o id
        const resp = await this.client.query(`
        select * from atendimento where id_atendimento = '${id}';   
        `);
        return resp.rows[0];
    }
    
    async set_status(id_atendimento, status) {
        // Seta o status do atendimento(Escolha inteiros para representar os possiveis estados) 
        try {
          const query = `UPDATE atendimento SET status = $1 WHERE id_atendimento = $2`;
          const values = [status, id_atendimento];
          const result = await this.client.query(query, values);
          return result.rowCount === 1;
        } catch (err) {
          console.error("Erro ao atualizar o status do atendimento: ", err);
          throw err;
        }
      }

      async get_profissionais(){
        // Retorna todos os profissionais
        const query = await this.client.query(`select * from (usuario u join profissional p on(p.cpf = u.cpf))
        left join usuario_imagem i on(i.usuario_cpf = u.cpf);
        `)
        return query.rows;
      }
      
      async datas_diponiveis(cpf_profissional, intervalo, hora_entrada, hora_saida){
        // Retorna as datas de atendimento disponiveis para tal profissional no intervalo passado
        const hoje = new Date();
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + intervalo);
        var availableTimes = [];

        // Loop entre as datas
        while (startDate <= endDate) {

          // Verificando se a data é um dia útil (segunda a sexta-feira)
          if (startDate.getDay() !== 0 && startDate.getDay() !== 6) {
            
            const startHour = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hora_entrada);
            const endHour = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), hora_saida);
            
            // Loop entre as horas disponíveis no expediente
            while (startHour < endHour && (startHour.getTime() >= hoje.getTime()) ) {
              availableTimes.push(new Date(startHour)); // adiciona uma cópia da data
              startHour.setMinutes(startHour.getMinutes() + 60);
            }
          }
          startDate.setDate(startDate.getDate() + 1);
        }
        var unAvaliableTimes = await this.client.query(`select data_atendimento from atendimento where profissional_cpf ='${cpf_profissional}'`);
        unAvaliableTimes = unAvaliableTimes.rows;
        for(var i=0; i < unAvaliableTimes.length; i++){
            var data = unAvaliableTimes[i].data_atendimento;
            for(var j=0; j < availableTimes.length; j++){
              if(data.getTime() == availableTimes[j].getTime()){
                availableTimes.splice(j, 1);
                break;
              }
            }
        }
        return availableTimes;
      }
}

module.exports = atendimentoDAO;