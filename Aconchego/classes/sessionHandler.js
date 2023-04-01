class Session{
    // Classe para representar uma sessao indiviudal
    constructor(num, data_validade){
        this.num = num;
        this.validade = data_validade;
    }
}


class SesionHandler{
    // Classe responsável pelo controle das sessoes ativas
    constructor(){
        console.log('Inicializando SesionHandler');
        this.lista = {};
        this.numeros_usados = {};

    }
    novaSessao(cpf){
        // Cria uma nova sessão para tal cpf
        var validade = 10000;
        if(cpf in this.lista){
            // Ja existe uma sessao para tal conta, deslogue a sessao anterior
            var old = this.lista[cpf];
            var num = parseInt(Math.random()*10000) + 10000;
            while(num in this.numeros_usados){
                var num = parseInt(Math.random()*10000) + 10000;
            }
            this.lista[cpf] = new Session(num, validade);
            delete this.numeros_usados[old];
            return num
        }
        else{
            // Login novo para tal conta
            var num = parseInt(Math.random()*10000) + 10000;
            while(num in this.numeros_usados){
                var num = parseInt(Math.random()*10000) + 10000;
            }
            this.numeros_usados[num] = true;
            this.lista[cpf] = new Session(num, validade);
            return num
        }
    }
    apagarSessao(cpf){
        // Apaga a sessao referente a tal cpf
        if(cpf in this.lista){
            delete this.numeros_usados[this.lista[cpf].num];
            delete this.lista[cpf];
            return true;
        }
        return false;
    }
    validarSessao(num){
        // Dado o token da sessao, retorna o cpf relativo a tal token
        if(num in this.numeros_usados){
            // Procure o cpf referente a tal token e o retorne
            for(var key in this.lista){
                if (this.lista[key].num == num){
                    return key;
                }
            }
        }
        return -1
    }
}

module.exports = SesionHandler;

// O token armazenado como cookie vai ser responsavel por autenticar o usuario no sistema
// O usuario tem token:
//  Esse token se refere a qual cpf? -> Acesso liberado
// O usuario nao tem token:
//  Vai logar: CPF e senha, verifico se já existe um token associado a tal cpf, se existe deleto, senao o crio -> Acesso liberado


// É necessário implementar a validade do token.