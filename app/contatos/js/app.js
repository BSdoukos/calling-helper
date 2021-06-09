$(document).ready(() => {
    $('main .spinner-border').addClass('d-none');

    window.displayContacts = function() {
        if (localStorage.getItem('contacts')) {
            const contacts = JSON.parse(localStorage.getItem('contacts'));

            if (!contacts.length) {
                $('#noContactsInfo').removeClass('d-none');
                $('#contactContainer').addClass('d-none');
                return;
            }

            const contactList = $('#contactList');

            const contactNames = contacts.map((contact) => contact.name).sort();
            let sortedContacts = [];
            contactNames.forEach((name) => contacts.filter((contact) => contact.name === name).forEach((filteredContact) => sortedContacts.push(filteredContact)));
    
            $('#contactContainer').removeClass('d-none');
            $('#noContactsInfo').addClass('d-none');
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

            return;
        } else {
            $('#noContactsInfo').removeClass('d-none');
        }
        
    }

    displayContacts();

    // Visualização de contatos
    $(document).on('click', '.contact-viewing-btn', function(e) {
        // Sinaliza o cartão de contato selecionado como ativo
        $('.card-list__item.active').removeClass('active');
        $(e.target).parents('.card-list__item').addClass('active');

        // Coleta o ID do contato solicitado e o busca no localStorage
        const contact = Contact.get(parseInt($(e.target).parents('[data-contact-id]').attr('data-contact-id')));
    
        const modal = new ContactView(contact, $('#contactModal'));
        modal.open();
    });

    $('.undo-contact-deletion-btn').on('click', function() {
        const contacts = JSON.parse(localStorage.getItem('contacts'));
        contacts.push(window.recentlyDeletedContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
        displayContacts();
        $(this).parent('.alert').removeClass('d-flex').addClass('d-none');
    });

    // Direcionamento para contato especificado na URL (se houver)
    const params = new URLSearchParams(location.search);

    if (params.has('id')) {
        $(`.card-list__item[data-contact-id="${params.get('id')}"] .contact-viewing-btn`).get(0).click();
        history.replaceState({}, document.title, "contatos.html");
    }
});
