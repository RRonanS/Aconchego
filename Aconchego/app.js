// Path das telas
const index_end = __dirname+'/public/pages/index.html';
const login_end = __dirname+'/public/pages/login.html';

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

// Modifica os formularios das telas de localhost para endereco, armazena a pagina html em formato string
var index_html = set_endereco(index_end, endereco);
var login_html = set_endereco(login_end, endereco);

// Inicializacao do app
const oneDay = 1000 * 60 * 60 * 24;

var usuario = new usuarioDAO();
var sh = new Sh();

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(porta);
app.use(express.static(__dirname + 'public/'));
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
    res.send(index_html);
});

app.get('/login', function(req, res){
    // Tela de login
    res.send(login_html);
});

app.post('/efetuarlogin', function(req, res){
    // Clicou para fazer login
    const cpf = req.body.cpf;
    const senha = req.body.senha;
    if(validar_cpf(cpf)){
        // Valida o cpf e verifica se as credenciais são validas para efetuar a autenticacao do usuario
        if(usuario.logar(cpf, senha)){
            // Armazena o token referente a sessao do usuario como cookie
            req.session.sessao = sh.novaSessao(cpf);
            req.session.save();
            res.redirect('/menu');
        }
        else{
            // Credenciais invalidas, alertar usuario
        }
    }
    else{
        // Cpf invalido
        res.redirect('/login');
    }
});

app.get('/cadastro', function(req, res){
    // Tela de cadastro

});

app.post('/efetuarcadastro', function(req, res){
    // Clicou para cadastrar

});

app.get('/menu', function(req, res){
    // Dado o perfil do usuario mostra seu menu
});
