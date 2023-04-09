const cheerio = require('cheerio');

function validar_cpf(cpf) {
  return true;
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove tudo que não for dígito
  if (cpf.length !== 11) {
    return false; // O CPF deve ter exatamente 11 dígitos
  }
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false; // CPF com todos os dígitos iguais são inválidos
  }
  // Calcula os dígitos verificadores
  var v1 = 0, v2 = 0;
  for (var i = 0, len = cpf.length - 1; i < len; i++) {
    v1 += cpf.charAt(i) * (len - i);
    v2 += cpf.charAt(i) * (len - i + 1);
  }
  v1 = (v1 % 11 < 2) ? 0 : (11 - v1 % 11);
  v2 = (v2 + v1 * 2) % 11;
  v2 = (v2 < 2) ? 0 : (11 - v2);
  // Verifica se os dígitos verificadores estão corretos
  if (cpf.charAt(cpf.length - 2) != v1 || cpf.charAt(cpf.length - 1) != v2) {
    return false;
  }
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
  elemento.text(novo_conteudo);
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

module.exports.validar_cpf = validar_cpf;
module.exports.validar_email = validar_email;
module.exports.validar_telefone = validar_telefone;
module.exports.html_replace = html_replace;
module.exports.html_replace_att = html_replace_att;