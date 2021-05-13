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

/// Visualização de contatos
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
        $('#saveContactChangesBtn').removeClass('d-none');
        $('#cancelContactChangesBtn').removeClass('d-none');
        $('#editContactBtn').removeClass('d-none');
    });

    $(document).on('input', '#contactModal input[data-contact-info]', function() {
        // Impede que campos vazios sejam submetidos
        if ($('#contactModal input[data-contact-info]').get().some((input) => !input.value.length)) {
            $('#saveContactChangesBtn').prop('disabled', true);
        } else {
            $('#saveContactChangesBtn').prop('disabled', false);
        }
    });

    window.disableEdition = function() {
        const editedElements = $('#contactModal input[data-contact-info]');

        editedElements.each((i, el) => {
            el.replaceWith(editableElements[i].get(0));
        });

        $('#saveContactChangesBtn, #cancelContactChangesBtn').addClass('d-none');
        $('#editContactBtn').removeClass('d-none');

        window.editedConversations = null;
    }

    // Ativa o botão "Cancelar"
    $('#cancelContactChangesBtn').on('click', function(e) {
        disableEdition();
    });

    // Edição de mais de uma conversa
    $(document).on('input', '[data-contact-info="conversations"] [data-contact-info]', () => {
        if (!this.editedConversations) {
            this.editedConversations = [];
        }

        const conversationInputs = $('[data-contact-info="conversations"] [data-contact-info]');

        const edition = {
            name: conversationInputs.parents('#contactModal').find('.conversation-selector').val(),
            topic: $('[data-contact-info="topic"]').val(),
            text: $('[data-contact-info="text"]').val()
        };

        const prevEdition = this.editedConversations.filter((conv) => conv.name === edition.name)[0];

        
        if (prevEdition) {
            this.editedConversations[this.editedConversations.indexOf(prevEdition)] = edition;
        } else {
            this.editedConversations.push(edition);
        }
    });
})();

// Atualização de contatos
(function(){
    $('#saveContactChangesBtn').on('click', function() {
        const newInfo = {}

        $('#contactModal [data-contact-info]').each((i, el) => {
            const elementLabel = el.getAttribute('data-contact-info');

            if (['conversations', 'topic', 'text'].every((label) => elementLabel !== label)) {
                if (el.tagName === 'INPUT') {
                    newInfo[elementLabel] = el.value;
                } else {
                    newInfo[elementLabel] = el.innerText;
                }
            }
        });

        if (window.editedConversations) {
            newInfo.conversations = [];

            const firstConversation = editedConversations.filter((conv) => conv.name === '1ª conversa')[0];
            if (firstConversation) {
                newInfo.conversations[0] = {
                    topic: firstConversation.topic,
                    text: firstConversation.text
                };
            }

            const returnVisits = editedConversations.filter((conv) => conv.name.match(/\d+ª revisita/g));
            if (returnVisits) {
                returnVisits.forEach((conv) => {
                    newInfo.conversations[conv.name.match(/\d+/g)[0]] = {
                        topic: conv.topic,
                        text: conv.text
                    };
                });
            }

        } else {
            newInfo.conversations = Contact.get($('.card-list__item.active').data('contact-id')).conversations;        
        }

        let contact = new Contact(newInfo.name, newInfo.number, newInfo.lastCall, newInfo.conversations);
        
        contact = Contact.get($('.card-list__item.active').data('contact-id')).merge(contact);
        console.log(contact);
        Contact.remove($('.card-list__item.active').data('contact-id'));
        contact.save();

        disableEdition();

        contact.displayData('#contactModal');
    });
})();