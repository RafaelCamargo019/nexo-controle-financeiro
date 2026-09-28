const initialTransactions = [
  {id:1,description:'Salário',category:'Salário',date:'2026-09-05',type:'income',amount:7200},
  {id:2,description:'Projeto freelance',category:'Freelance',date:'2026-09-18',type:'income',amount:1350},
  {id:3,description:'Aluguel',category:'Moradia',date:'2026-09-08',type:'expense',amount:1850},
  {id:4,description:'Supermercado',category:'Alimentação',date:'2026-09-23',type:'expense',amount:486.75},
  {id:5,description:'Internet residencial',category:'Moradia',date:'2026-09-21',type:'expense',amount:119.90},
  {id:6,description:'Academia',category:'Saúde',date:'2026-09-20',type:'expense',amount:99.90},
  {id:7,description:'Combustível',category:'Transporte',date:'2026-09-17',type:'expense',amount:240},
  {id:8,description:'Cinema',category:'Lazer',date:'2026-09-14',type:'expense',amount:76}
];

let transactions = JSON.parse(localStorage.getItem('nexo-transactions') || 'null') || initialTransactions;
let privacy = false;
let lastAdded = null;
const currency = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const shortCurrency = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});
const dateFmt = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
const icons = {'Salário':'▣','Freelance':'✦','Moradia':'⌂','Alimentação':'◇','Saúde':'＋','Transporte':'➜','Lazer':'☆','Educação':'▤','Outros':'○'};
const categoryLimits = {Moradia:2200,Alimentação:1000,Transporte:600,Lazer:450,Saúde:400,Educação:500,Outros:350};
const months = [{name:'Abr',income:6100,expense:4400},{name:'Mai',income:6800,expense:4100},{name:'Jun',income:6400,expense:4650},{name:'Jul',income:7300,expense:4200},{name:'Ago',income:6900,expense:4900},{name:'Set',income:8550,expense:0}];

function save(){localStorage.setItem('nexo-transactions',JSON.stringify(transactions));}
function money(value){return privacy?'R$ ••••':currency.format(value);}
function totals(){
  const income=transactions.filter(t=>t.type==='income').reduce((a,t)=>a+t.amount,0);
  const expense=transactions.filter(t=>t.type==='expense').reduce((a,t)=>a+t.amount,0);
  return {income,expense,balance:income-expense};
}
function updateDashboard(){
  const {income,expense,balance}=totals();
  document.querySelector('#balanceValue').textContent=money(balance);
  document.querySelector('#incomeValue').textContent=money(income);
  document.querySelector('#expenseValue').textContent=money(expense);
  document.querySelector('#budgetSpent').textContent=privacy?'R$ ••••':shortCurrency.format(expense);
  document.querySelector('#forecastValue').textContent=privacy?'+ R$ ••••':`${balance>=0?'+ ':''}${shortCurrency.format(balance)}`;
  const percent=Math.min(Math.round(expense/6000*100),100);
  document.querySelector('#budgetPercent').textContent=`${percent}%`;
  document.querySelector('#budgetRing').style.background=`conic-gradient(var(--lime) ${percent*3.6}deg,#243650 0deg)`;
  months[5].expense=expense;
  renderChart();renderRecent();renderTable();renderCategoryBudgets();
}
function renderChart(){
  const count=Number(document.querySelector('#periodSelect').value);
  const data=months.slice(-count);const max=Math.max(...data.flatMap(m=>[m.income,m.expense]),1);
  document.querySelector('#cashChart').innerHTML=data.map(m=>`<div class="bar-group"><i class="bar income" style="height:${m.income/max*88}%" title="Receitas em ${m.name}: ${currency.format(m.income)}"></i><i class="bar expense" style="height:${m.expense/max*88}%" title="Despesas em ${m.name}: ${currency.format(m.expense)}"></i><span class="bar-label">${m.name}</span></div>`).join('');
}
function transactionRow(t,table=false){
  const sign=t.type==='income'?'+':'−';
  if(table)return `<tr><td><strong>${escapeHtml(t.description)}</strong></td><td>${t.category}</td><td>${dateFmt.format(new Date(t.date+'T12:00:00'))}</td><td><span class="type-badge ${t.type}">${t.type==='income'?'Receita':'Despesa'}</span></td><td class="align-right ${t.type}"><strong>${privacy?'R$ ••••':`${sign} ${currency.format(t.amount)}`}</strong></td><td><button class="delete-btn" data-delete="${t.id}" aria-label="Excluir ${escapeHtml(t.description)}">×</button></td></tr>`;
  return `<div class="transaction-item"><span class="transaction-icon">${icons[t.category]||'○'}</span><div><strong>${escapeHtml(t.description)}</strong><span>${t.category} · ${dateFmt.format(new Date(t.date+'T12:00:00'))}</span></div><div class="transaction-amount ${t.type}"><strong>${privacy?'R$ ••••':`${sign} ${currency.format(t.amount)}`}</strong><span>${t.type==='income'?'Recebido':'Pago'}</span></div></div>`;
}
function renderRecent(){document.querySelector('#recentTransactions').innerHTML=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4).map(t=>transactionRow(t)).join('');}
function renderTable(){
  const q=document.querySelector('#searchInput').value.toLowerCase();const type=document.querySelector('#typeFilter').value;const category=document.querySelector('#categoryFilter').value;
  const filtered=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).filter(t=>(t.description.toLowerCase().includes(q)||t.category.toLowerCase().includes(q))&&(type==='all'||t.type===type)&&(category==='all'||t.category===category));
  document.querySelector('#transactionsTable').innerHTML=filtered.map(t=>transactionRow(t,true)).join('');
  document.querySelector('#emptyState').hidden=filtered.length>0;
}
function renderCategoryBudgets(){
  const expenses=transactions.filter(t=>t.type==='expense').reduce((acc,t)=>{acc[t.category]=(acc[t.category]||0)+t.amount;return acc;},{});
  document.querySelector('#categoryBudgets').innerHTML=Object.entries(categoryLimits).slice(0,5).map(([cat,limit])=>{const spent=expenses[cat]||0;const pct=Math.min(spent/limit*100,100);return `<div class="category-row ${spent>limit?'over':''}"><div><span>${icons[cat]}</span><strong>${cat}</strong></div><small>${money(spent)} / ${privacy?'••••':shortCurrency.format(limit)}</small><div class="small-progress"><i style="width:${pct}%"></i></div></div>`}).join('');
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function showView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${name}`));
  document.querySelectorAll('.nav-item').forEach(b=>{const active=b.dataset.view===name;b.classList.toggle('active',active);active?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');});
  const titles={inicio:'Seu dinheiro, com clareza.',transacoes:'Movimentos sob controle.',planejamento:'Planos que cabem na vida.'};document.querySelector('#pageTitle').textContent=titles[name];
  document.querySelector('#sidebar').classList.remove('open');document.querySelector('#menuBtn').setAttribute('aria-expanded','false');window.scrollTo({top:0,behavior:'smooth'});
}
function showToast(title='Lançamento salvo',message='Seu saldo foi atualizado.'){
  const toast=document.querySelector('#toast');toast.querySelector('strong').textContent=title;toast.querySelector('small').textContent=message;toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove('show'),4500);
}
function populateCategories(){const select=document.querySelector('#categoryFilter');[...new Set(transactions.map(t=>t.category))].sort().forEach(c=>select.insertAdjacentHTML('beforeend',`<option>${c}</option>`));}

document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.go)));
document.querySelector('#menuBtn').addEventListener('click',e=>{const side=document.querySelector('#sidebar');side.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',side.classList.contains('open'));});
document.querySelector('#privacyBtn').addEventListener('click',e=>{privacy=!privacy;e.currentTarget.setAttribute('aria-pressed',privacy);e.currentTarget.querySelector('.desktop-label').textContent=privacy?'Mostrar valores':'Ocultar valores';updateDashboard();});
document.querySelector('#themeBtn').addEventListener('click',()=>{document.body.classList.toggle('light');document.querySelector('#themeBtn').textContent=document.body.classList.contains('light')?'☾':'☼';});
document.querySelector('#periodSelect').addEventListener('change',renderChart);
['searchInput','typeFilter','categoryFilter'].forEach(id=>document.querySelector(`#${id}`).addEventListener(id==='searchInput'?'input':'change',renderTable));

const dialog=document.querySelector('#transactionDialog');
document.querySelectorAll('.open-transaction').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#dateInput').value='2026-09-28';document.querySelector('#formError').textContent='';dialog.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>document.querySelector('#descriptionInput').focus(),50);}));
function closeDialog(){dialog.hidden=true;document.body.style.overflow='';}
document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',closeDialog));
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.hidden)closeDialog();});
document.querySelectorAll('.type-switch button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.type-switch button').forEach(x=>x.classList.toggle('active',x===b));document.querySelector('#transactionType').value=b.dataset.type;}));
document.querySelector('#transactionForm').addEventListener('submit',e=>{
  e.preventDefault();const desc=document.querySelector('#descriptionInput').value.trim();const amount=Number(document.querySelector('#amountInput').value.replace('.','').replace(',','.'));const date=document.querySelector('#dateInput').value;
  if(desc.length<2||!amount||amount<=0||!date){document.querySelector('#formError').textContent='Confira a descrição, o valor e a data antes de salvar.';return;}
  lastAdded={id:Date.now(),description:desc,amount,date,type:document.querySelector('#transactionType').value,category:document.querySelector('#formCategory').value};transactions.push(lastAdded);save();updateDashboard();closeDialog();e.target.reset();document.querySelector('#transactionType').value='expense';showToast();
});
document.querySelector('#undoBtn').addEventListener('click',()=>{if(!lastAdded)return;transactions=transactions.filter(t=>t.id!==lastAdded.id);save();updateDashboard();lastAdded=null;document.querySelector('#toast').classList.remove('show');showToast('Ação desfeita','O lançamento foi removido.');});
document.querySelector('#transactionsTable').addEventListener('click',e=>{const btn=e.target.closest('[data-delete]');if(!btn)return;const item=transactions.find(t=>t.id===Number(btn.dataset.delete));if(confirm(`Excluir “${item.description}”? Esta ação não poderá ser desfeita.`)){transactions=transactions.filter(t=>t.id!==item.id);save();updateDashboard();showToast('Transação excluída','Os totais foram recalculados.');}});
document.querySelector('#goalBtn').addEventListener('click',()=>{const current=8500;document.querySelector('#goalCurrent').textContent=money(current);document.querySelector('#goalBar').style.width='57%';document.querySelector('#goalBtn').disabled=true;document.querySelector('#goalBtn').textContent='R$ 100 adicionados';showToast('Meta atualizada','Você está mais perto da sua reserva.');});
document.querySelector('#newGoalBtn').addEventListener('click',()=>showToast('Recurso demonstrativo','O cadastro de novas metas pode ser integrado depois.'));
document.querySelector('#exportBtn').addEventListener('click',()=>{const header='Descrição,Categoria,Data,Tipo,Valor';const rows=transactions.map(t=>[t.description,t.category,t.date,t.type,t.amount.toFixed(2)].map(v=>`"${String(v).replaceAll('"','""')}"`).join(','));const blob=new Blob([[header,...rows].join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='transacoes-nexo.csv';a.click();URL.revokeObjectURL(a.href);showToast('Arquivo preparado','As transações foram exportadas em CSV.');});

populateCategories();updateDashboard();
