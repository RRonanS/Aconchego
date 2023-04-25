const form = document.querySelector('#form_recuperar');
const feedback = document.querySelector('#feedback');
const email = document.querySelector('#email');

form.addEventListener('submit', (event) => {

// mostra mensagem de feedback
feedback.innerText = "Um email será enviado para "+email.value+" com as instruções para recuperação";
});
