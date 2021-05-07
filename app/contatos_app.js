$(document).ready(() => {
    $('main .spinner-border').addClass('d-none');

    if (localStorage.getItem('contacts')) {
        const contacts = JSON.parse(localStorage.getItem('contacts'));
        $('#contactList').removeClass('d-none');

        contacts.forEach((contact) => {
            $('#contactList').append(`
                <li class="card-list__item">
                    <div class="card">
                        <div class="card-body">
                        <h5 class="card-title">${contact.name}</h5>
                            <p class="card-text mb-1">Telefone: <b>${contact.number}</b></p>
                            <p class="card-text">Último contato em: <b>25/04/2021 14:42</b></p>
                            <button class="btn btn-primary">Abrir contato</button>
                        </div>
                    </div>
                </li>
            `);
        });
    } else {
        $('#noContactsInfo').removeClass('d-none');
    }
});

// localStorage.setItem('contacts', JSON.stringify([{name: 'Maria', number: '(51) 98826-1671'}]))