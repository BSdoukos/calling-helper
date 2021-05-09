$(document).ready(() => {
    $('main .spinner-border').addClass('d-none');

    if (localStorage.getItem('contacts')) {
        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const contactList = $('#contactList');

        $('#contactContainer').removeClass('d-none');

        contacts.forEach((contact) => {
            contactList.append(`
                <li class="card-list__item" data-contact-id="${contact.id}">
                    <div class="card">
                        <div class="card-body">
                        <h5 class="card-title">${contact.name}</h5>
                            <p class="card-text">Telefone: <b>${contact.number}</b></p>
                            <button class="btn btn-primary contact-viewing-btn" data-bs-toggle="modal" data-bs-target="#contactModal">Abrir contato</button>
                        </div>
                    </div>
                </li>
            `);
        });
    } else {
        $('#noContactsInfo').removeClass('d-none');
    }
});

// Visualização de contatos
(function() {
    $(document).on('click', '.contact-viewing-btn', function(e) {
        // Coleta o ID do contato solicitado e o busca no localStorage
        const contact = Contact.get(parseInt($(e.target).parents('[data-contact-id]').attr('data-contact-id')));

        // Exibe as informações do contato no modal "Dados do contato"
        Array.from(document.querySelectorAll('[data-contact-info]')).forEach((el) => {
            const dataContactInfo = el.getAttribute('data-contact-info');

            if (contact[dataContactInfo]) {
                if (dataContactInfo !== 'conversations') {
                    el.innerText = contact[dataContactInfo];
                } else {
                    const conversationsElements = $(el).find('[data-contact-info]');

                    conversationsElements.each(function(i, element) {
                        $(element).text(contact.conversations[contact.conversations.length - 1][$(element).attr('data-contact-info')]);
                    });
                }
            }
        });
    });
})();