$(document).ready(() => {
    $('main .spinner-border').addClass('d-none');

    if (localStorage.getItem('contacts')) {
        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const contactList = $('#contactList');

        $('#contactContainer').removeClass('d-none');

        contacts.forEach((contact) => {
            if (!contactList.hasClass('card-list--grid') && contactList.find('div').length > 0) {
                contactList.addClass('card-list--grid');
            }
            contactList.append(`
                <li class="card-list__item">
                    <div class="card">
                        <div class="card-body">
                        <h5 class="card-title">${contact.name}</h5>
                            <p class="card-text mb-1">Telefone: <b>${contact.number}</b></p>
                            <p class="card-text">Último contato em: <b>${contact.lastCall}</b></p>
                            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#contactModal">Abrir contato</button>
                        </div>
                    </div>
                </li>
            `);
        });
    } else {
        $('#noContactsInfo').removeClass('d-none');
    }
});