const { load } = require("cheerio");
const { readFileSync } = require("fs");

function set_endereco(pagina, end){
    // Recebe o caminho para uma pagina html, abre ela, modifica o endereco de seus formularios para o endereço definido nas variaveis
    // e retorna em string o html atualizado da pagina.
    const html = readFileSync(pagina);
    const $ = load(html);

    $('form').each(function(){
        const action = $(this).attr('action');
        const newAction = action.replace('localhost:8080', end);
        $(this).attr('action' ,newAction);
    });
    return $.html();
};

module.exports = set_endereco;
