function validar_cpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g,''); // Remove tudo que não for dígito
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
  
module.exports.validar_cpf = validar_cpf;
