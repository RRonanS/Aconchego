// Path das telas
const index_end = __dirname+'/public/pages/index.html';
const login_end = __dirname+'/public/pages/login.html';
const painel_end = __dirname+'/public/pages/painel.html';
const pacientes_end = __dirname+'/public/pages/pacientes.html';
const recuperasenha_end = __dirname+'/public/pages/recuperar_senha.html';
const resetarsenha_end = __dirname+'/public/pages/confirmar_senha.html';
const registro_end = __dirname+'/public/pages/registro.html';

// Modulos proprios
var usuarioDAO = require('./classes/usuarioDAO');
var variaveis = require("./funcoes/variaveis");
var auxiliares = require('./funcoes/auxiliares');
var Sh = require('./classes/sessionHandler');
const porta = variaveis.porta;
const Pr = require('./classes/passwordRecoverHandler');
const endereco = variaveis.endereco;
const set_endereco = require("./funcoes/enderecamento");
const validar_cpf = auxiliares.validar_cpf;
const validar_email = auxiliares.validar_email;
const validar_telefone = auxiliares.validar_telefone;
const html_replace = auxiliares.html_replace;
const html_replace_att = auxiliares.html_replace_att;

// Modulos externos
var express = require("express");
var bodyParser = require("body-parser");
var sessions = require('express-session');
const fs = require("fs");
const { dirname } = require('path');
const multer = require('multer');

// Modifica os formularios das telas de localhost para endereco, armazena a pagina html em formato string
var index_html = set_endereco(index_end, endereco);
var login_html = set_endereco(login_end, endereco);
var painel_html = set_endereco(painel_end, endereco);
var pacientes_html = set_endereco(pacientes_end, endereco);
var recuperarsenha_html = set_endereco(recuperasenha_end, endereco);
var resetarsenha_html = set_endereco(resetarsenha_end, endereco);
var registro_html = set_endereco(registro_end, endereco);

// Inicializacao do app
const oneDay = 1000 * 60 * 60 * 24;

var usuario = new usuarioDAO();
var recuperadorSenha = new Pr();
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
// Multer utilizado para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

console.log("Servidor iniciado na porta "+porta);

app.get('/cookie', function(req, res){
    // FUNCAO DE DEBUG, NAO IRÁ PARA PRODUCAO, imprime os cookies armazenados
    console.log(req.session);
});

app.get('/imagem', function(req, res){
    // FUNCAO DE DEBUG PARA TELA DE ADICIONAR IMAGEM, NAO IRÁ PARA PRODUCAO,
    res.sendFile(__dirname+'/public/pages/uploadimagem.html');
});

app.post('/addimagem', upload.single('imagem'), async function(req, res) {
    // DEBUG ADICIONA A IMAGEM A DETERMINADO USUARIO
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo de imagem enviado');
    }
    
    const cpf = req.body.cpf;
    const imagem = req.file.buffer;
    var resp = await usuario.set_imagem(cpf, imagem);
    res.redirect('/addimagem');
});

app.get('/checkimage', async function(req, res){
    // DEBUG, MOSTRA A IMAGEM DE DETERMINADO USUARIO
    var cpf = (req.query.cpf);
    console.log(cpf);
    var resp = await usuario.get_imagem(cpf);
    console.log(resp);
    var buffer = resp.imagem;
    res.writeHead(200, {
      'Content-Type': 'image/jpeg',
      'Content-Length': buffer.length
    });
    res.end(buffer);
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
            // Credenciais invalidas
            var temp = html_replace_att(login_html, "feedback", "hidden", false);
            res.send(temp);
        }
    }
    else{
        // Cpf invalido
        var temp = html_replace_att(login_html, "feedback", "hidden", false);
        res.send(temp);
    }
});

app.get('/cadastro', function(req, res){
    // Tela de cadastro
    var id = req.session.sessao;
    // Verifica se o usuario já está autenticado
    if(id == undefined){
        res.send(registro_html);
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

app.post('/efetuarcadastro', upload.single('imagem'), async function(req, res){
    // Clicou para cadastrar
    var nome = req.body.nome; 
    var cpf = req.body.cpf
    var senha = req.body.senha;
    if(!req.file){
        var foto = null;
    }
    else{
        var foto = req.file.buffer;
    }
    var telefone = undefined;
    var endereco = req.body.endereco;
    var email = req.body.email;
    if(senha.lenght < 6){
        console.log('senha curta');
        res.redirect('/cadastro');
        return
    }
    else if(!validar_cpf(cpf)){
        console.log('cpf invalido');
        res.redirect('/cadastro');
        return
    }
    else if(nome.lenght <= 5){
        console.log('nome curto');
        res.redirect('/cadastro');
    }
    else if(!validar_email(email)){
        console.log('email invalido');
        res.redirect('/cadastro');
    }
    else if(!validar_telefone(telefone)){
        console.log('telefone invalido');
        res.redirect('/cadastro');
    }
    else{
        var result = await usuario.cadastrar(cpf, senha, nome, foto, endereco, email);
        if(!result){
            // Já existe uma conta com tal chave primaria
            var resp = html_replace_att(registro_html, "feedback", "hidden", false);
            res.send(resp);
        }
        else{
            // Cadastro efetuado com sucesso
            res.redirect("/login");
        }
    }
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

app.get('/agendamento', function(req, res){
    // Tela de agendamento
});

app.get('/perfil', function(req, res){
    // Mostra o perfil de determinado usuario
    var perfil_cpf = req.body.cpf;

});

app.get('/recuperacao', function(req, res){
    // Tela para pedir para recuperar senha
    res.send(recuperarsenha_html);
});

app.post('/recuperarsenha', function(req, res){
    // Envia um email de recuperacao de senha, caso a conta associada a tal email exista
    var email = req.body.email;
    if(usuario.check_email(email)){
        recuperadorSenha.sendEmail(email);
        var resp = html_replace_att(recuperarsenha_html, "feedback", "hidden", false);
        res.send(resp);
    }

});

app.get('/resetarsenha', function(req, res){
    // Tela para redefinir senha
    var token = req.query.token;
    if(token == undefined){
        // Erro, token indefinido
        var temp = html_replace_att(resetarsenha_html, "feedback", "hidden", false);
        res.send(temp);
    }
    else{
        var temp = html_replace_att(resetarsenha_html, "token", "value", token);
        res.send(temp);
    }
});

app.post('/redefinirsenha', async function(req, res){
    // Redefine a senha do usuario no banco de dados
    var token = req.body.token;
    var email = recuperadorSenha.isValidToken(token);
    if(email != undefined){
        var nova_senha = req.body.senha;
        var resp = await usuario.redefinirSenha(email, nova_senha);
        res.redirect('/login');
    }
    else{
        // Token invalido
        var temp = html_replace_att(resetarsenha_html, "feedback", "hidden", false);
        res.send(temp);
    }

});


// Release 1:
//  Realizar sistema de cadastro e de login,
//  Realizar consultas com pacientes e realizar a designação dos padrinhos nos atendimentos 
