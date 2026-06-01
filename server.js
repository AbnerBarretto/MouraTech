const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Dados em memória (simulando um banco de dados)
let produtos = [
    { id: 1, nome: 'Teclado Mecânico RGB', qtd: 15, preco: 250.00 },
    { id: 2, nome: 'Mouse Gamer 12000 DPI', qtd: 20, preco: 150.00 }
];
let proximoId = 3;

// Rotas da API
app.get('/api/produtos', (req, res) => {
    res.json(produtos);
});

app.post('/api/produtos', (req, res) => {
    const { nome, qtd, preco } = req.body;
    const novoProduto = {
        id: proximoId++,
        nome,
        qtd: parseInt(qtd),
        preco: parseFloat(preco)
    };
    produtos.push(novoProduto);
    res.status(201).json(novoProduto);
});

app.put('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, qtd, preco } = req.body;
    const index = produtos.findIndex(p => p.id === id);

    if (index !== -1) {
        produtos[index] = {
            id,
            nome,
            qtd: parseInt(qtd),
            preco: parseFloat(preco)
        };
        res.json(produtos[index]);
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});

app.delete('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = produtos.findIndex(p => p.id === id);

    if (index !== -1) {
        produtos.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'Produto não encontrado' });
    }
});

// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
