// Chamando e configurando dependências do projeto.

const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const dotenv = require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

// Rota que mostra a página HTML usada para o disparo de emails
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); 
});

// Endpoint para envio de e-mails
app.post('/sendemails', upload.single('file'), async (req, res) => {
    const { to, subject, text } = req.body;
    const file = req.file;

    if (!to || !subject || !text) {
        return res.status(400).json({ error: "Os campos 'to', 'subject' e 'text' são obrigatórios." });
    } // Validação dos campos obrigatórios, retornando erro caso estejam nulos

    try {
        const transportmail = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User_email,
                pass: process.env.User_senha,
            },
        }); // Cria uma estrutura de controle de um transportador de email

        const mailOptions = { // Objeto que define detalhes do email
            from: process.env.User_email,
            to,
            subject,
            text,
            attachments: file
                ? [
                      {
                          filename: file.originalname,
                          path: file.path,
                      },
                  ]
                : [],
        };

        const send = await transportmail.sendMail(mailOptions); //função assíncrona de envio do email
 
        // Função pra excluir o arquivo do servidor para evitar o acúmulo
        if (file) {
            fs.unlink(file.path, (err) => {
                if (err) console.error('Erro ao apagar o arquivo:', err);
            });
        }

        // Verificação de envio sucedidos ou não
        res.status(200).json({ message: 'E-mail enviado', send });
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        res.status(500).json({ error: 'Erro ao enviar o e-mail.' });
    }
});

// Inicializa o servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor rodando....`);
});