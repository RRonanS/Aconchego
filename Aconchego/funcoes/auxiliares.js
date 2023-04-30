const cheerio = require('cheerio');

function validar_cpf(cpf) {
  cpf = cpf.replace(/[^\d]+/g,'');
  if (cpf.length !== 11) return false;

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let rest = sum % 11;
  let digit = rest < 2 ? 0 : 11 - rest;

  if (parseInt(cpf.charAt(9)) !== digit) return false;

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rest = sum % 11;
  digit = rest < 2 ? 0 : 11 - rest;

  if (parseInt(cpf.charAt(10)) !== digit) return false;

  return true;
}


function validar_email(email) {
  return true;
}

function validar_telefone(telefone) {
  return true;
}

function html_replace(html, id, novo_conteudo) {
  // Substitui o conteudo do elemento id desse html pelo novo conteudo
  const $ = cheerio.load(html);
  const elemento = $('#'+id);
  elemento.html(novo_conteudo);
  const result = $.html();
  return result;
}

function html_replace_att(html, id, att, novo_valor){
  // Altera atributo de determinado elemento
  const $ = cheerio.load(html);
  const elemento = $('#'+id);
  if(novo_valor == false){
    elemento.removeAttr(att);
  }
  else{
    elemento.attr(att, novo_valor);
  }
  const result = $.html();
  return result;
}

function listar_pacientes_html(html, pacientes){
    // Itera sobre a tela de pacientes, adicionando cada paciente da lista, por fim a retorna
    var texto = ``;
    for(let i in pacientes){
      var paciente = pacientes[i];
      const buffer = paciente.imagem;
      const base64 = buffer.toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`; 
      texto += `
        <div style="padding: 10px;">
          <form action="/paciente" method="get" id="form_paciente">
            <input type="hidden" name="cpf" value="${paciente.cpf}">
            <a href="javascript:{}" onclick="document.getElementById('form_paciente').submit();">
              <img src="${dataUri}" alt="${paciente.nome}" width="150" height="150">
              <p>
              ${paciente.nome}
              </p>
            </a>
          </form>
        </div>
      `
    }
    return html_replace(html, 'lista', texto);
}

function listar_consultas_html(html, consultas, paciente=true){
    // Gera a lista de consultas em html
    var texto = ``;
    if(!paciente){
      html = html_replace(html, 'h_consultas', 'Próximos pacientes')
    }
    for(var i=0; i < consultas.length; i++){
      var consulta = consultas[i];
      var id_consulta = consulta.id_atendimento;
      var atual = new Date();
      var nome = consulta.nome;
      var is_paciente = false;
      if(paciente){
        nome = 'Doutor ' + nome;
        is_paciente = true;
      }
      var hora = consulta.data_atendimento.getHours();
      if(hora < 10){
        hora = '0' + hora;
      }
      var minuto = consulta.data_atendimento.getMinutes();
      if(minuto < 10){
        minuto = '0' + minuto;
      }
      var dia = consulta.data_atendimento.getDate();
      var mes = consulta.data_atendimento.getMonth();
      if(dia < 10){
        dia = '0' + dia;
      }
      if(mes < 10){
        mes = '0' + (mes+1);
      }
      var dia_consulta =`${dia}/${mes}`;
      if(consulta.data_atendimento.getDate() == atual.getDate() && consulta.data_atendimento.getMonth() == atual.getMonth()){
        dia_consulta = 'Hoje';
      }

      var dataUri = undefined;
      const buffer = consulta.imagem;
      if(buffer != undefined){
        const base64 = buffer.toString('base64');
        dataUri = `data:image/jpeg;base64,${base64}`; 
      }
      texto += `
        <div class="content-box">
          <form action="/check_consulta" method="get" id="form_consulta">
            <input name="id_consulta" id="id_consulta" value="${id_consulta}" hidden>
            <input name="is_paciente" id="is_paciente" value="${is_paciente}" hidden>
            <a href="javascript:{}" onclick="document.getElementById('form_consulta').submit();">
              <img src="${dataUri}" width="100" height="100" style="width: 100; height: 100;">
              <p> ${nome}</p>
              <p>${dia_consulta} às ${hora}</p>
            </a>
          </form>
        </div>
      `;
    }
    return html_replace(html, 'div_consultas', texto);
};

function listar_profissionais_html(html, profissionais){
    // Lista os profissionais disponiveis na tela de agendamento
    texto = ``;
    for(var i=0; i < profissionais.length; i++){
        var p = profissionais[i];
        var dataUri = undefined;
        const buffer = p.imagem;
        if(buffer != undefined){
          const base64 = buffer.toString('base64');
          dataUri = `data:image/jpeg;base64,${base64}`; 
        }
        texto += `
        <div class="content-box">
          <form action="agendamento" method="get"  id="form_${p.cpf}">
            <input type="number" name="cpf" value="${p.cpf}" hidden>
            <a href="javascript:{}" onclick="document.getElementById('form_${p.cpf}').submit();" title="Doutor ${p.nome}">
              <img src="${dataUri}"  alt="${p.nome}" class="doctor-image" data-doctor="Médico 1" style="width: 100px; height: 100px;">
              <p id="big-rectangle-text"> Doutor ${p.nome}</p>
            </a>
          </form>
        </div>
        `;
    }
    return html_replace(html, 'profissionais', texto);
}

function listar_horarios_html(html, lista, cpf){
    // Coloca no html a lista de horarios do profissional
    texto = ``;
    for(var i=0; i < lista.length; i++){
      var data = lista[i];
      var hora = data.getHours();
      if(hora < 10){
        hora = '0' + hora;
      }
      var minuto = data.getMinutes();
      if(minuto < 10){
        minuto = '0' + minuto;
      }
      var dia = data.getDate();
      var mes = data.getMonth();
      if(dia < 10){
        dia = '0' + dia;
      }
      if(mes < 10){
        mes = '0' + (mes+1);
      }
      texto += `
      <option value="${data}">Dia ${dia}/${mes} às ${hora}:${minuto}</option>
      `;
    }
    html = html_replace_att(html, 'cpf_data', 'value', cpf);
    return html_replace(html, 'data_atendimento', texto);
}

function listar_historico_html(html, historico){
    // Adiciona ao html o historico de consultas de determinado paciente
    texto = ``;
    for(var i=0; i < historico.length; i++){
      data = historico[i].data_atendimento;
      var hora = data.getHours();
      if(hora < 10){
        hora = '0' + hora;
      }
      var minuto = data.getMinutes();
      if(minuto < 10){
        minuto = '0' + minuto;
      }
      var dia = data.getDate();
      var mes = data.getMonth();
      if(dia < 10){
        dia = '0' + dia;
      }
      if(mes < 10){
        mes = '0' + (mes+1);
      }
      var ano = data.getYear();
      texto += `
      <tr>
        <td>${dia}/${mes}/${ano} ${hora}:${minuto}</td>
        <td>null</td>
        <td>${historico[i].anotacoes}</td>
      </tr>
      `;
    }
    return html_replace(html, 'table_paciente', texto);
}

module.exports.validar_cpf = validar_cpf;
module.exports.validar_email = validar_email;
module.exports.validar_telefone = validar_telefone;
module.exports.html_replace = html_replace;
module.exports.html_replace_att = html_replace_att;
module.exports.listar_pacientes_html = listar_pacientes_html;
module.exports.listar_consultas_html = listar_consultas_html;
module.exports.listar_profissionais_html = listar_profissionais_html;
module.exports.listar_horarios_html = listar_horarios_html;
module.exports.listar_historico_html = listar_historico_html;
