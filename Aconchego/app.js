// Path das telas
const index_end = __dirname+'/public/pages/index.html';
const login_end = __dirname+'/public/pages/login.html';
const painel_end = __dirname+'/public/pages/painel.html';
const pacientes_end = __dirname+'/public/pages/pacientes.html'

// Modulos proprios
var usuarioDAO = require('./classes/usuarioDAO');
var variaveis = require("./funcoes/variaveis");
var auxiliares = require('./funcoes/auxiliares');
var Sh = require('./classes/sessionHandler');
const porta = variaveis.porta;
const endereco = variaveis.endereco;
const set_endereco = require("./funcoes/enderecamento");
const validar_cpf = auxiliares.validar_cpf;

// Modulos externos
var express = require("express");
var bodyParser = require("body-parser");
var sessions = require('express-session');
const fs = require("fs");
const { dirname } = require('path');

// Modifica os formularios das telas de localhost para endereco, armazena a pagina html em formato string
var index_html = set_endereco(index_end, endereco);
var login_html = set_endereco(login_end, endereco);
var painel_html = set_endereco(painel_end, endereco);
var pacientes_html = set_endereco(pacientes_end, endereco);

// Inicializacao do app
const oneDay = 1000 * 60 * 60 * 24;

var usuario = new usuarioDAO();
var sh = new Sh();

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(porta);
app.use(express.static(__dirname + '/public'));
app.use(sessions({
    secret: "secret",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: true
}));
console.log("Servidor iniciado na porta "+porta);

app.get('/cookie', function(req, res){
    // FUNCAO DE DEBUG, NAO IRÁ PARA PRODUCAO, imprime os cookies armazenados
    console.log(req.session);
});

app.get('/', function(req, res){
    // Pagina inicial
    //res.send(index_html);
    res.redirect('/login');
});

app.get('/login', function(req, res){
    // Tela de login
    var id = req.session.sessao;
    // Verifica se o usuario já está autenticado
    if(id == undefined){
        res.send(login_html);
    }
    else{
        var cpf = sh.validarSessao(id);
        if(cpf == -1){
            req.session.destroy();
            res.send(login_html);
        }
        else{
            res.redirect('/menu')
        }
    }
});

app.post('/efetuarlogin', async function(req, res){
    // Clicou para fazer login
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    if(validar_cpf(cpf)){
        // Valida o cpf e verifica se as credenciais são validas para efetuar a autenticacao do usuario
        if(await usuario.logar(cpf, senha)){
            // Armazena o token referente a sessao do usuario como cookie
            req.session.sessao = sh.novaSessao(cpf);
            req.session.save();
            res.redirect('/menu');
        }
        else{
            // Credenciais invalidas, alertar usuario
            console.log('CRED INVALIDAS');
            res.redirect('/login');
        }
    }
    else{
        // Cpf invalido, alertar usuario
        console.log('CPF INVALIDO');
        res.redirect('/login');
    }
});

app.get('/cadastro', function(req, res){
    // Tela de cadastro

});

app.post('/efetuarcadastro', function(req, res){
    // Clicou para cadastrar

});

app.get('/logout', function(req, res){
    // Finaliza a sessao do usuario
    if(req.session.sessao != undefined){
        sh.apagarSessao(sh.validarSessao(req.session.sessao));
        req.session.destroy();
    }
    res.redirect('/');
});

app.get('/menu', async function(req, res){
    // Dado o perfil do usuario mostra seu menu
    var session_id = req.session.sessao;
    // Verifica se ele está autenticado
    if(session_id != undefined){
        console.log(sh.lista, sh.numeros_usados);
        console.log(session_id);
        var cpf = sh.validarSessao(req.session.sessao);
        if(cpf != -1){
            var perfil = await usuario.get_perfil(cpf);
            console.log(perfil);
            res.send(painel_html);
        }
        else{
            req.session.destroy();
            res.redirect('/login');
        }
    }
    else{
        res.redirect('/login')
    }
});

app.get('/pacientes', async function(req, res){
    // Retorna a tela de pacientes caso autenticado e perfil profissional
    var session_id = req.session.sessao;
    if(session_id != undefined){
        var cpf = sh.validarSessao(session_id);
        if(cpf != -1){
            var perfil = await usuario.get_perfil(cpf);
            if(perfil == 'profissional' || perfil == 'administrador'){
                // Valido
                res.send(pacientes_html);
            }
            else{
                // Perfil invalido
                res.redirect('/menu');
            }
        }
        else{
            // Sessao invalidada
            req.session.sessao.destroy();
            res.redirect('/login');
        }
    }
    else{
        res.redirect('/login');
    }
});