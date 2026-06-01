const API_URL = '/api/produtos';

// Elementos do DOM
const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');
const inputId = document.getElementById('produto-id');
const inputNome = document.getElementById('nome');
const inputQtd = document.getElementById('qtd');
const inputPreco = document.getElementById('preco');
const btnSalvar = document.getElementById('btn-salvar');
const tituloFormulario = document.getElementById('titulo-formulario');
const formActions = document.getElementById('form-actions');

// Variável global para armazenar os produtos carregados localmente
let produtosLocais = [];

// Função para mostrar notificações Toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.display = 'block';
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Função para buscar e renderizar os produtos
async function carregarProdutos() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error('Falha ao carregar produtos');
        
        produtosLocais = await resposta.json();

        tabela.innerHTML = ''; // Limpa a tabela antes de renderizar

        if (produtosLocais.length === 0) {
            tabela.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum produto em estoque.</td></tr>`;
            return;
        }

        produtosLocais.forEach(produto => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${produto.id}</td>
                <td style="font-weight: 500;">${produto.nome}</td>
                <td>${produto.qtd} unid.</td>
                <td>R$ ${produto.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="actions-cell">
                    <button class="btn-edit" onclick="prepararEdicao(${produto.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deletarProduto(${produto.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tabela.appendChild(tr);
        });
    } catch (erro) {
        console.error('Erro ao buscar produtos:', erro);
        showToast('Erro ao carregar o estoque.', 'error');
    }
}

// Função que puxa os dados da tabela e joga no formulário para edição
function prepararEdicao(id) {
    const produto = produtosLocais.find(p => p.id === id);
    if (produto) {
        inputId.value = produto.id;
        inputNome.value = produto.nome;
        inputQtd.value = produto.qtd;
        inputPreco.value = produto.preco;

        // Modifica a interface para o modo de Edição
        tituloFormulario.innerHTML = `<i class="fas fa-edit"></i> Editar Produto`;
        btnSalvar.innerHTML = `<i class="fas fa-check"></i> <span>Salvar Alterações</span>`;
        btnSalvar.style.backgroundColor = 'var(--info)';

        // Cria o botão Cancelar dinamicamente se ele já não existir
        if (!document.getElementById('btn-cancelar')) {
            const btnCancelar = document.createElement('button');
            btnCancelar.id = 'btn-cancelar';
            btnCancelar.type = 'button';
            btnCancelar.className = 'btn-cancel';
            btnCancelar.innerHTML = '<i class="fas fa-times"></i> Cancelar Edição';
            btnCancelar.onclick = resetarFormulario;
            formActions.appendChild(btnCancelar);
        }
        
        // Scroll suave para o formulário em mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Função para limpar o formulário e voltar ao estado original de cadastro
function resetarFormulario() {
    form.reset();
    inputId.value = "";
    tituloFormulario.innerHTML = `<i class="fas fa-plus-circle"></i> Cadastrar Novo Produto`;
    btnSalvar.innerHTML = `<i class="fas fa-save"></i> <span>Adicionar ao Estoque</span>`;
    btnSalvar.style.backgroundColor = ''; // Volta ao CSS padrão

    // Remove o botão cancelar se ele existir na tela
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.remove();
    }
}

// Envio do formulário (Decide entre Cadastro OU Edição baseado no ID)
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = inputId.value;
    const nome = inputNome.value;
    const qtd = inputQtd.value;
    const preco = inputPreco.value;

    const dadosProduto = { nome, qtd, preco };

    try {
        let resposta;

        if (id) {
            // Se tem ID no campo oculto, atualiza (PUT)
            resposta = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto)
            });
        } else {
            // Se não tem ID, cria um novo (POST)
            resposta = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosProduto)
            });
        }

        if (resposta.ok) {
            showToast(id ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!', 'success');
            resetarFormulario();
            carregarProdutos(); // Atualiza a tabela na tela
        } else {
            showToast('Erro ao salvar o produto.', 'error');
        }
    } catch (erro) {
        console.error('Erro ao enviar dados:', erro);
        showToast('Erro de conexão com o servidor.', 'error');
    }
});

// Função para deletar um produto
async function deletarProduto(id) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (resposta.ok) {
                showToast('Produto removido do estoque.', 'success');
                // Se o produto que está sendo editado for deletado, limpa o painel
                if (inputId.value == id) resetarFormulario();
                carregarProdutos();
            } else {
                showToast('Erro ao remover produto.', 'error');
            }
        } catch (erro) {
            console.error('Erro ao deletar produto:', erro);
            showToast('Erro de conexão.', 'error');
        }
    }
}

// Inicializa a listagem assim que a página carrega
carregarProdutos();
