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

// Edição de contatos
(function() {
    // Localiza os elementos que contém informações editáveis
    const editableInfo = ['name', 'number', 'topic', 'text'];
    const editableElements = [];

    editableInfo.forEach((info) => editableElements.push($(`[data-contact-info="${info}"]`)));

    $('#editContactBtn').on('click', function() {
        // Transforma os elementos em campos de texto
        editableElements.forEach((el) => {
            const inputType = el.attr('data-contact-info') === 'number' ? 'tel' : 'text';      
            el.replaceWith(`<input type="${inputType}" value="${el.text()}" class="form-control mt-2 mb-3" data-contact-info="${el.data('contact-info')}"></input>`);
        });

        // Exibe os botões "Salvar mudanças" e "Cancelar" e esconde o botão "Editar"
        $('#saveContactChangesBtn, #cancelContactChangesBtn').removeClass('d-none');
        $('#editContactBtn').addClass('d-none');
    });

    $('#cancelContactChangesBtn').on('click', function() {
        const editedElements = $('#contactModal input[data-contact-info]');

        editedElements.each((i, el) => {
            el.replaceWith(editableElements[i].get(0));
        });

        $('#saveContactChangesBtn, #cancelContactChangesBtn').addClass('d-none');
        $('#editContactBtn').removeClass('d-none');
    });
})();