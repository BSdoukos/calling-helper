$(document).ready(() => {
    $('main .spinner-border').addClass('d-none');

    window.displayContacts = function() {
        if (localStorage.getItem('contacts')) {
            const contacts = JSON.parse(localStorage.getItem('contacts'));
            const contactList = $('#contactList');

            const contactNames = contacts.map((contact) => contact.name).sort();
            let sortedContacts = [];
            contactNames.forEach((name) => contacts.filter((contact) => contact.name === name).forEach((filteredContact) => sortedContacts.push(filteredContact)));
    
            $('#contactContainer').removeClass('d-none');
            contactList.html('');

            sortedContacts.forEach((contact) => {
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
    }

    displayContacts();
});

/// Visualização de contatos
(function() {
    $(document).on('click', '.contact-viewing-btn', function(e) {
        // Sinaliza o cartão de contato selecionado como ativo
        $('.card-list__item.active').removeClass('active');
        $(e.target).parents('.card-list__item').addClass('active');

        // Coleta o ID do contato solicitado e o busca no localStorage
        const contact = Contact.get(parseInt($(e.target).parents('[data-contact-id]').attr('data-contact-id')));
   
        const modal = new ContactView(contact, $('#contactModal'));
        modal.open();
    });
})();