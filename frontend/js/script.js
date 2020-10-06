const url = 'http://localhost:3001/users';

let users = [];
let inputSearch = null;
let buttonSearch = null;
let spinnerLoading = null;

const MINIMUM_LENGTH_SEARCH = 1;

const formatter = Intl.NumberFormat('pt-BR');

/* Função start para iniciar a chamada das outras funções
A função deve ser iniciada em algum momento, de preferência no final do código
async é utilizado pois existe uma função await
As demais funções só serão iniciadas quando a await terminar de receber os dados
*/
async function start() {
  await fetchUsers();
  mapIds();
  addEvents();
  enableControls();

  showNoUsers();
  showNoStatistics();
}

/*Função para receber o arquivo json com os dados dos usuários
os dados são recebidos em binário, por isso deve usar .json
*/
async function fetchUsers() {
  const res = await fetch(url);
  const json = await res.json();

  users = json
    .map(({ login, name, picture, gender, dob }) => {
      return {
        id: login.uuid,
        name: `${name.first} ${name.last}`,
        filterName: `${name.first} ${name.last}`.toLowerCase(),
        picture: picture.large,
        gender: gender,
        age: dob.age,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

//Recebimento dos dados do html
function mapIds() {
  inputSearch = document.querySelector('#inputSearch');
  buttonSearch = document.querySelector('#buttonSearch');
  spinnerLoading = document.querySelector('#spinnerLoading');
  divUsers = document.querySelector('#divUsers');
  divStatistics = document.querySelector('#divStatistics');
}

//Função para adicionar o evento de procura, com suas restrições
function addEvents() {
  inputSearch.addEventListener('keyup', handleInputChange);
  buttonSearch.addEventListener('click', () =>
    filterUsers(inputSearch.value.trim())
  );
}

/*Função para habilitar a procura de acordo com suas restrições e para tirar
o botão de loading através do materialize
*/
function enableControls() {
  setTimeout(() => {
    inputSearch.disabled = false;
    inputSearch.focus();

    spinnerLoading.classList.add('hidden');
  }, 1000);
}

//Função para bloquear a pesquisa caso haja uma das restrições
function handleInputChange(event) {
  const searchText = event.target.value.trim();
  const length = searchText.length;

  buttonSearch.disabled = length < MINIMUM_LENGTH_SEARCH;

  if (event.key !== 'Enter') {
    return;
  }

  if (length < MINIMUM_LENGTH_SEARCH) {
    return;
  }

  filterUsers(searchText);
}

//Função para receber os valores digitados e compará-los com os dados dos usuários
function filterUsers(searchText) {
  const lowerCaseSearchText = searchText.toLowerCase();

  const filteredUsers = users.filter((user) => {
    return user.filterName.includes(lowerCaseSearchText);
  });

  handleFilteredUsers(filteredUsers);
}

//Função para mostrar na tela de acordo com a pesquisa
function handleFilteredUsers(users) {
  if (users.length === 0) {
    showNoUsers();
    showNoStatistics();
  }

  showUsers(users);
  showStatisticsFrom(users);
}

//Exibição de tela quando não houver resultado na pesquisa
function showNoStatistics() {
  divStatistics.innerHTML = `<h2>Nada a ser exibido</h2>`;
}

//Exibição de tela quando não houver resultado na pesquisa
function showNoUsers() {
  divUsers.innerHTML = `<h2>Nenhum usuário filtrado</h2>`;
}

//Função para mostrar os usuários através do appendChild
function showUsers(users) {
  const h2 = document.createElement('h2');
  h2.textContent = users.length + ' usuário(s) encontrado(s)';

  const ul = document.createElement('ul');

  users.map(({ name, picture, age }) => {
    const li = document.createElement('li');
    li.classList.add('flex-row');

    const img = `<img class='avatar' src=${picture} alt=${name} title=${name} />`;
    const span = `<span>${name}, ${age} anos</span>`;

    li.innerHTML = `${img} ${span}`;
    ul.appendChild(li);
  });

  divUsers.innerHTML = '';
  divUsers.appendChild(h2);
  divUsers.appendChild(ul);
}

//Função para mostrar os usuários através de template literals
function showStatisticsFrom(users) {
  const countMale = users.filter((user) => user.gender === 'male').length;
  const countFemale = users.filter((user) => user.gender === 'female').length;
  const sumAges = users.reduce((acc, curr) => acc + curr.age, 0);
  //Tirando o erro da divisão por 0
  const averageAges = (sumAges / users.length || 0)
    .toFixed(2)
    .replace('.', ',');

  divStatistics.innerHTML = `
      <h2>Estatísticas</h2>

      <ul>
        <li>Sexo masculino: <strong>${countMale}</strong></li>
        <li>Sexo feminino: <strong>${countFemale}</strong></li>
        <li>Soma das idades: <strong>${formatValue(sumAges)}</strong></li>
        <li>Média das idades: <strong>${averageAges}</strong></li>
      </ul>    
    `;
}

//Função para formatar os valores
function formatValue(value) {
  return formatter.format(value);
}

start();
