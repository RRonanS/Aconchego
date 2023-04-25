const nodemailer = require("nodemailer"); // Biblioteca para envio de email
const variaveis = require("../funcoes/variaveis"); // Variaveis do sistema
const end = variaveis.endereco;
const aconchego = variaveis.email;

class passwordRecoverHandler {
    // Classe para criar, armazenar e gerenciar tokens de recuoeracao de senha
    constructor() {
        console.log('Inicializando objeto passwordRecoverHandler');
        this.tokens = {};
        this.transporter = nodemailer.createTransport({
            // Conexao a conta que envia emails de recuperacao
            service: aconchego.service,
            auth: {
              user: aconchego.endereco,
              pass: aconchego.senha
            }
          });
    }

    generateToken(email) {
        // Gera um novo token de recuperação de senha dado o email
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);
        this.tokens[token] = {
            email: email,
            expirationDate: expirationDate
        };
        console.log("Token de recuperação gerado para", email, token);
        return token;
    }

    isValidToken(token) {
        // Verifica se tal token é válido, retornando undefined ou email associado
        const tokenData = this.tokens[token];
        if(tokenData && new Date() < tokenData.expirationDate){
            return tokenData.email;
        }
        return undefined;
    }

    removeToken(token) {
        // Deleta o token
        delete this.tokens[token];
    }

    async sendEmail(email){
        const token = this.generateToken(email);

        const resetUrl = `http://${end}/resetarsenha?token=${token}`;

        // Corpo do email
        const emailBody = `Olá,\n\nVocê solicitou a recuperação de senha. 
        Clique no link a seguir para redefinir sua senha:\n\n${resetUrl}\n\nEste link é válido por 24 horas.\n\n
        Se você não solicitou a recuperação de senha, ignore este email.\n\nAtenciosamente,\nSua equipe de suporte`;

        // Configuração do email
        const mailOptions = {
        from: aconchego.endereco,
        to: email,
        subject: '[Aconchego] Recuperação de senha',
        text: emailBody
        };

        // Envia o email
        const result = await this.transporter.sendMail(mailOptions);
        console.log(`Email enviado para ${email}: ${result.response}`);
    }
}

module.exports = passwordRecoverHandler;
