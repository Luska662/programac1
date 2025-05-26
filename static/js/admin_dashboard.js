// Função para inicializar os gráficos
function initCharts() {
    // Gráfico de Vendas
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Vendas',
                data: [1500, 2100, 1800, 2400, 1900, 2500, 2200, 2800, 3000, 2700, 3500, 4000],
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + context.raw.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Gráfico de Categorias
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    const categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: ['Eletrônicos', 'Roupas', 'Acessórios', 'Outros'],
            datasets: [{
                data: [55, 30, 10, 5],
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw + '%';
                        }
                    }
                }
            },
            cutout: '80%',
        },
    });

    return { salesChart, categoryChart };
}

// Função para gerar relatório XLSX do dashboard
function generateDashboardReport() {
    // Criar uma nova workbook
    const wb = XLSX.utils.book_new();
    
    // Dados para a primeira aba (Resumo)
    const summaryData = [
        ["Relatório do Dashboard - " + new Date().toLocaleString()],
        ["Gerado por: " + document.querySelector('.user-name').textContent],
        [],
        ["Estatísticas", "Valor"],
        ["Vendas Totais", document.querySelector('.sales-total').textContent],
        ["Total de Pedidos", document.querySelector('.orders-total').textContent],
        ["Pedidos Pendentes", document.querySelector('.pending-orders').textContent],
        ["Total de Produtos", document.querySelector('.total-products').textContent],
        [],
        ["Última Atualização", new Date().toLocaleString()]
    ];

    // Adicionar aba de resumo
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

    // Adicionar aba de Pedidos
    const ordersTable = document.getElementById('orders-table');
    if (ordersTable) {
        const wsOrders = XLSX.utils.table_to_sheet(ordersTable);
        XLSX.utils.book_append_sheet(wb, wsOrders, "Pedidos");
    }

    // Adicionar aba de Produtos
    const productsTable = document.getElementById('products-table');
    if (productsTable) {
        const wsProducts = XLSX.utils.table_to_sheet(productsTable);
        XLSX.utils.book_append_sheet(wb, wsProducts, "Produtos");
    }

    // Gerar o arquivo XLSX
    XLSX.writeFile(wb, `relatorio_dashboard_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Função para carregar a biblioteca XLSX dinamicamente
function loadXLSXLibrary(callback) {
    if (typeof XLSX === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        callback();
    }
}

// Configurar botões de exportação
function setupExportButtons() {
    // Botão de relatório do dashboard
    document.getElementById('generateReport')?.addEventListener('click', function(e) {
        e.preventDefault();
        
        const btn = e.target.closest('a');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
        btn.disabled = true;

        loadXLSXLibrary(function() {
            generateDashboardReport();
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        });
    });

    // Botão de exportação completa (já é tratado pelo Flask)
    document.querySelector('a[href*="exportar-relatorio-completo"]')?.addEventListener('click', function(e) {
        const btn = e.target.closest('a');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparando...';
        
        // O download será iniciado pelo Flask, então não precisamos fazer nada aqui
        // O spinner continuará até a página recarregar
    });
}

// Função principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa os gráficos
    const charts = initCharts();
    
    // Configura os botões de exportação
    setupExportButtons();
    
    // Configura o botão de atualização do gráfico de vendas
    document.getElementById('refreshSalesChart')?.addEventListener('click', function(e) {
        e.preventDefault();
        // Simula atualização de dados
        const newData = charts.salesChart.data.datasets[0].data.map(value => 
            value * (0.9 + Math.random() * 0.2) // Gera valores aleatórios ±10%
        );
        charts.salesChart.data.datasets[0].data = newData;
        charts.salesChart.update();
        
        // Feedback visual
        const btn = e.target.closest('a');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Atualizado';
        
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    });

    // Configura o botão de exportação do gráfico de vendas
    document.getElementById('exportSalesData')?.addEventListener('click', function(e) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = charts.salesChart.toBase64Image();
        link.download = 'grafico_vendas.png';
        link.click();
    });

    // Configura o botão de exportação do gráfico de categorias
    document.getElementById('exportCategoriesData')?.addEventListener('click', function(e) {
        e.preventDefault();
        const link = document.createElement('a');
        link.href = charts.categoryChart.toBase64Image();
        link.download = 'grafico_categorias.png';
        link.click();
    });
});