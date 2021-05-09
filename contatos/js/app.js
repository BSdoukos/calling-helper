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
        // Sinaliza o cartão de contato selecionado como ativo
        $('.card-list__item.active').removeClass('active');
        $(e.target).parents('.card-list__item').addClass('active');

        // Coleta o ID do contato solicitado e o busca no localStorage
        const contact = Contact.get(parseInt($(e.target).parents('[data-contact-id]').attr('data-contact-id')));

        // Exibe as informações do contato no modal "Dados do contato"
        contact.displayData('#contactModal');
    });
})();

// Visualização de conversas
(function() {
    $(document).on('change', '#contactModal .conversation-selector', function() {
        const contact = Contact.get(parseFloat($('.card-list__item.active').attr('data-contact-id')));
        const selector = $('#contactModal .conversation-selector');

        contact.displayData('#contactModal', selector.find(`option:contains("${selector.val()}")`).index());
    });
})();