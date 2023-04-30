// Path das telas
const index_end = __dirname+'/public/pages/home.html';
const login_end = __dirname+'/public/pages/login.html';
const painel_end = __dirname+'/public/pages/painel.html';
const pacientes_end = __dirname+'/public/pages/pacientes.html';
const recuperasenha_end = __dirname+'/public/pages/recuperar_senha.html';
const resetarsenha_end = __dirname+'/public/pages/confirmar_senha.html';
const registro_end = __dirname+'/public/pages/registro.html';
const embreve_end = __dirname+'/public/pages/tela_provisoria.html';
const agendamento_end = __dirname+'/public/pages/agendamento.html';
const perfil_end = __dirname+'/public/pages/perfil.html';
const check_consulta = __dirname+'/public/pages/check_consulta.html';
const his_paciente = __dirname+'/public/pages/historico_paciente.html'

// Outros paths
const defaultUserImage = '/images/user_resized.png';

// Modulos proprios
var usuarioDAO = require('./classes/usuarioDAO');
var atendimentoDAO = require('./classes/atendimentoDAO');
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
const { isNumber } = require('util');

// Modifica os formularios das telas de localhost para endereco, armazena a pagina html em formato string
var index_html = set_endereco(index_end, endereco);
var login_html = set_endereco(login_end, endereco);
var painel_html = set_endereco(painel_end, endereco);
var pacientes_html = set_endereco(pacientes_end, endereco);
var recuperarsenha_html = set_endereco(recuperasenha_end, endereco);
var resetarsenha_html = set_endereco(resetarsenha_end, endereco);
var registro_html = set_endereco(registro_end, endereco);
var agendamento_html = set_endereco(agendamento_end, endereco);
var perfil_html = set_endereco(perfil_end, endereco);
var check_consulta_html = set_endereco(check_consulta, endereco);
var hist_paciente_html = set_endereco(his_paciente, endereco);

// Inicializacao do app
const oneDay = 1000 * 60 * 60 * 24;

var usuario = new usuarioDAO();
var recuperadorSenha = new Pr();
var atendimento = new atendimentoDAO();
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
    res.redirect('/imagem');
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
    res.send(index_html);
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
    if(cpf == undefined || senha == undefined){
        var temp = html_replace_att(login_html, "feedback", "hidden", false);
        res.send(temp);
    }
    else if(validar_cpf(cpf)){
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
            var resp = painel_html;
            // Esconde as opcoes dado o perfil
            if(perfil != 'administrador'){
                resp = html_replace_att(resp, 'opcao_gerenciamento', 'hidden', true);
            }
            if(perfil != 'profissional'){
                resp = html_replace_att(resp, 'opcao_pacientes', 'hidden', true);
            }
            // Preenche a aba que mostra as proximas consultas
            if(perfil == 'paciente'){
                consultas = await atendimento.get_consultas_paciente(cpf, new Date());
                resp = auxiliares.listar_consultas_html(resp, consultas);
            }
            if(perfil == 'profissional'){
                consultas = await atendimento.get_consultas_profissional(cpf, new Date());
                resp = auxiliares.listar_consultas_html(resp, consultas, false);
            }
            res.send(resp);
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
                var pacientes = await atendimento.get_pacientes(cpf);
                // Gera a lista em html dos pacientes, junta na tela de pacientes e envia
                var tela = auxiliares.listar_pacientes_html(pacientes_html, pacientes);
                if(perfil != 'administrador'){
                    tela = html_replace_att(tela, 'opcao_gerenciamento', 'hidden', true);
                }
                res.send(tela);
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

app.get('/paciente', async function(req, res){
    // Tela para mostrar um determinado paciente do profissional
    var cpf_paciente = req.query.cpf;
    if(cpf_paciente == undefined || isNaN(cpf_paciente) || cpf_paciente == ''){
        // Evita consultas invalidas ao banco
        res.redirect('/pacientes');
        return
    }
    var session_id = req.session.sessao;
    if(session_id != undefined){
        var cpf = sh.validarSessao(session_id);
        if(cpf != -1){
            var perfil = await usuario.get_perfil(cpf);
            if(perfil == 'profissional' || perfil == 'administrador'){
                // Valido, retorne a tela com os dados do paciente
                var resp = hist_paciente_html;
                resp = html_replace(resp, 'nome', 'Historico do paciente '+await usuario.get_nome(cpf_paciente));
                var atendimentos = await atendimento.get_atendimentosPaciente(cpf, cpf_paciente);
                // Itere sobre o html adicionando os dados
                resp = auxiliares.listar_historico_html(resp, atendimentos);
                // Esconde as opcoes dado o perfil
                if(perfil != 'administrador'){
                    resp = html_replace_att(resp, 'opcao_gerenciamento', 'hidden', true);
                }
                if(perfil != 'profissional'){
                    resp = html_replace_att(resp, 'opcao_pacientes', 'hidden', true);
                }
                res.send(resp);
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

app.get('/agendamento', async function(req, res){
    // Tela de agendamento
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
            // Logado
            var resp = agendamento_html;
            if(req.query.cpf != undefined && req.query.cpf != '' && !isNaN(req.query.cpf)){
                // Há um doutor selecionado
                var datas = await atendimento.datas_diponiveis(req.query.cpf, 7, 6, 18);
                resp = auxiliares.listar_horarios_html(agendamento_html, datas, req.query.cpf);
            }
            var perfil = await usuario.get_perfil(cpf);
            // Esconde as opcoes dado o perfil
            if(perfil != 'administrador'){
                resp = html_replace_att(resp, 'opcao_gerenciamento', 'hidden', true);
            }
            if(perfil != 'profissional'){
                resp = html_replace_att(resp, 'opcao_pacientes', 'hidden', true);
            }
            resp = auxiliares.listar_profissionais_html(resp, await atendimento.get_profissionais());
            res.send(resp);
        }
    }
});

app.get('/agendar', async function(req, res){
    // Agenda no banco de dados
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
            // Logado
            const data = new Date(req.query.data_atendimento);
            const dataFormatada = data.toISOString();
            try{
                // Evitar consultas indevidas ao banco
                const resp = await atendimento.criar_atendimento(req.query.cpf, cpf, dataFormatada, 1);
            }
            catch(err){
                const resp = false;
            }
            res.redirect('/menu');
        }
    }
});

app.get('/perfil', async function(req, res){
    // Mostra a tela de perfil
    var id = req.session.sessao;
    // Verifica se o usuario já está autenticado
    if(id == undefined){
        res.redirect('/login');
    }
    else{
        var cpf = sh.validarSessao(id);
        if(cpf == -1){
            req.session.destroy();
            res.redirect('/login');
        }
        else{
            // Logado
            var resp = perfil_html;
            // Pega a imagem do usuario
            var buffer = await usuario.get_imagem(cpf);
            var dataUri = undefined;
            if(buffer != undefined){
              const base64 = buffer.toString('base64');
              dataUri = `data:image/jpeg;base64,${base64}`; 
            }
            var perfil = await usuario.get_perfil(cpf);
            // Esconde as opcoes dado o perfil
            if(perfil != 'administrador'){
                resp = html_replace_att(resp, 'opcao_gerenciamento', 'hidden', true);
            }
            if(perfil != 'profissional'){
                resp = html_replace_att(resp, 'opcao_pacientes', 'hidden', true);
            }
            if(dataUri == undefined){
                dataUri = defaultUserImage;
            }
            resp = html_replace(resp, 'foto', `<img src='${dataUri}'>`)
            resp = html_replace_att(resp, 'nome', 'value', await usuario.get_nome(cpf));
            resp = html_replace_att(resp, 'endereco', 'value', await usuario.get_endereco(cpf));
            resp = html_replace_att(resp, 'cpf', 'value', cpf);
            res.send(resp);
        }
    }

});

app.post('/salvar-perfil', upload.single('nova_foto'), async function(req, res){
    // Salva as mudanças no perfil do usuario
    const endereco = req.body.endereco;
    const cpf_usuario = req.body.cpf;
    const senha = req.body.senha;
    const nome = req.body.nome;
    if(!req.file){
        var foto = undefined;
    }
    else{
        var foto = req.file.buffer;
    }
    var session_id = req.session.sessao;
    if(session_id != undefined){
        // Validar que o usuario está logado e o perfil a alterar corresponde a seu perfil
        var cpf = sh.validarSessao(session_id);
        if(cpf != -1){
            if(cpf == cpf_usuario){
                // Mudanca valida
                if(endereco != undefined){
                    await usuario.set_endereco(cpf, endereco);
                }
                if(nome != undefined && nome.length >= 3){
                    await usuario.set_nome(cpf, nome);
                }
                if(senha != undefined && senha.length >= 6){
                    await usuario.set_senha(cpf, senha);
                }
                if(foto != undefined){
                    await usuario.set_imagem(cpf, foto);
                }
                res.redirect('/perfil');
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

app.get('/check_consulta', async function(req, res){
    // Tela para verificar uma consulta especifica
    var id = req.session.sessao;
    const id_antedimento = req.query.id_consulta;
    var is_paciente = undefined;
    try{
        is_paciente = req.query.is_paciente.toLowerCase() === "true";
    }
    catch(err){
        is_paciente = undefined;
    }
    if(id_antedimento == undefined || is_paciente == undefined || isNaN(id_antedimento) || id_antedimento == ''){
        // Verifica se a consulta ao banco não fere restricoes
        res.redirect('/menu');
        return
    }
    // Verifica se o usuario já está autenticado
    if(id == undefined){
        res.redirect('/login');
    }
    else{
        var cpf = sh.validarSessao(id);
        if(cpf == -1){
            req.session.destroy();
            res.redirect('/login')
        }
        else{
            // Logado
            if(id_antedimento != undefined){
                // Repoe os campos do html e o envia para o cliente
                var resp = check_consulta_html;
                var consulta = await atendimento.get_consulta(id_antedimento);
                if(consulta != undefined){
                    if(is_paciente){
                        var nome = await usuario.get_nome(consulta.profissional_cpf);
                        var foto = await usuario.get_imagem(consulta.profissional_cpf);
                        resp = html_replace(resp, 'nome', `Consulta com doutor ${nome}`);
                    }
                    else{
                        var nome = await usuario.get_nome(consulta.paciente_cpf);
                        var foto = await usuario.get_imagem(consulta.paciente_cpf);
                        resp = html_replace(resp, 'nome', `Consulta com paciente ${nome}`);
                    }
                    var buffer = foto;
                    var dataUri = defaultUserImage;
                    if(buffer != undefined){
                      const base64 = buffer.toString('base64');
                      dataUri = `data:image/jpeg;base64,${base64}`; 
                    }
                    resp = html_replace(resp, 'foto', `<img src='${dataUri}' alt='Imagem da consulta' style="width: 100px; height: 100px;">`);
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
                    const atual = new Date();
                    if(consulta.data_atendimento.getDate() == atual.getDate() && consulta.data_atendimento.getMonth() == atual.getMonth()){
                      dia_consulta = 'Hoje';
                    }
                    resp = html_replace(resp, 'data', `${dia_consulta} as ${hora} horas`); 
                    // Esconde as opcoes dado o perfil
                    const perfil = await usuario.get_perfil(cpf);
                    if(perfil != 'administrador'){
                        resp = html_replace_att(resp, 'opcao_gerenciamento', 'hidden', true);
                    }
                    if(perfil != 'profissional'){
                        resp = html_replace_att(resp, 'opcao_pacientes', 'hidden', true);
                    }
                    res.send(resp);
                }
                else{
                    res.redirect('/menu');
                }
            }
            else{
                res.redirect('/menu');
            }
        }
    }
})

// Release 1:
//  Realizar sistema de cadastro e de login,
//  Realizar consultas com pacientes e realizar a designação dos padrinhos nos atendimentos 

// Requisições para telas que não estarão nessa release
app.get('/sobrenos', function(req, res){
    res.sendFile(embreve_end);
});
app.get('/servico', function(req, res){
    res.sendFile(embreve_end);
});
app.get('/psicologos', function(req, res){
    res.sendFile(embreve_end);
});
app.get('/meditacao', function(req, res){
    res.sendFile(embreve_end);
});
app.get('/entrar_consulta', function(req, res){
    // redireciona para a página anterior
    const referer = req.get('referer');
    res.redirect(referer);
});
app.get('/remarcar_consulta', function(req, res){
    // redireciona para a página anterior
    const referer = req.get('referer');
    res.redirect(referer);
});
app.get('/apagar_conta', function(req, res){
    // redireciona para a página anterior
    const referer = req.get('referer');
    res.redirect(referer);
});