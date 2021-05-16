class ContactView {
    constructor(contact, container) {
        this.contact = contact;
        this.container = container;
        this.editableElements = ['name', 'number', 'topic', 'text'].map((info) => $(`[data-contact-info="${info}"]`));
        this.editedConversations = [];
        this.buttons = {
            edit: this.container.find('.edit-contact-btn'),
            cancel: this.container.find('.cancel-contact-changes-btn'),
            save: this.container.find('.save-contact-changes-btn'),
            createConversation: this.container.find('.create-conversation-btn'),
            cancelConversation: this.container.find('.cancel-conversation-btn'),
            saveConversation: this.container.find('.save-conversation-btn')
        }
    }

    switchConversation() {
        const select = $('#contactModal .conversation-selector');

        this.contact.displayData(`#${this.container.get(0).id}`, false, select.find(`option:contains("${select.val()}")`).index());
    }

    enableEdition() {
        this.editableElements.forEach((el) => {
            const inputType = el.attr('data-contact-info') === 'number' ? 'tel' : 'text';      
            el.replaceWith(`<input type="${inputType}" value="${el.text()}" class="form-control mt-2 mb-3" data-contact-info="${el.data('contact-info')}"></input>`);
        });
    }

    disableEdition() {
        this.contact.conversations.forEach((conv) => {
            if (conv.isUnsaved) {
                this.contact.conversations.splice(this.contact.conversations.indexOf(conv), 1);
            }
        });

        const editedElements = this.container.find('input[data-contact-info]');

        editedElements.each((i, el) => {
            el.replaceWith(this.editableElements[i].get(0));
        });

        window.editedConversations = null;

        this.contact.displayData(`#${this.container.get(0).id}`);
    }

    toggleButtons() {
        $('.contact-view-btn').toggleClass('d-none');
        this.buttons.createConversation.toggleClass('d-block');
    }

    verifyInputFilling() {
        if (this.container.find('input[data-contact-info]').get().some((input) => !input.value.length)) {
            $('#saveContactChangesBtn').prop('disabled', true);
        } else {
            $('#saveContactChangesBtn').prop('disabled', false);
        }
    }

    preSaveConversationChanges() {
        if (!this.editedConversations) {
            this.editedConversations = [];
        }

        const conversationInputs = this.container.find('[data-contact-info="conversations"] [data-contact-info]');

        const edition = {
            name: conversationInputs.parents(this.container).find('.conversation-selector').val(),
            topic: this.container.find('[data-contact-info="topic"]').val(),
            text: this.container.find('[data-contact-info="text"]').val()
        };

        const prevEdition = this.editedConversations.filter((conv) => conv.name === edition.name)[0];
        
        if (prevEdition) {
            this.editedConversations[this.editedConversations.indexOf(prevEdition)] = edition;
        } else {
            this.editedConversations.push(edition);
        }
    }

    saveChanges() {
        this.container.find('[data-contact-info]').each(function(i, el) {
            const elementLabel = el.getAttribute('data-contact-info');

            if (['conversations', 'topic', 'text'].every((label) => elementLabel !== label)) {
                if (el.tagName === 'INPUT') {
                    this.contact[elementLabel] = el.value;
                } else {
                    this.contact[elementLabel] = el.innerText;
                }
            }
        }.bind(this));

        if (this.editedConversations.length) {
            const firstConversation = this.editedConversations.filter((conv) => conv.name === '1ª conversa')[0];
            if (firstConversation) {
                this.contact.conversations[0] = {
                    topic: firstConversation.topic,
                    text: firstConversation.text
                };
            }

            const returnVisits = this.editedConversations.filter((conv) => conv.name.match(/\d+ª revisita/g));
            if (returnVisits) {
                returnVisits.forEach((conv) => {
                    this.contact.conversations[conv.name.match(/\d+/g)[0]] = {
                        topic: conv.topic,
                        text: conv.text
                    };
                });
            }

        }

        Contact.remove(this.contact.id);

        this.contact.conversations.forEach((conv) => {
            if (conv.isUnsaved) {
                delete conv.isUnsaved;
            }
        });

        this.contact.save();
    }

    enableConversationCreation() {
        const select = this.container.find('.conversation-selector');
        const newConversation = this.contact.conversations.length === 1 ? '1ª revisita' : `${this.contact.conversations.length}ª revisita`;

        this.container.off('input', '[data-contact-info="conversations"] [data-contact-info]', this.preSaveConversationChanges.bind(this));

        select.append(`<option value="${newConversation}">${newConversation}</option>`);
        select.val(newConversation);
        select.prop('disabled', true);

        const conversationInputs = this.container.find('[data-contact-info="conversations"] input[data-contact-info]');
        conversationInputs.val('');
        conversationInputs.get(0).focus();

        this.container.find('.contact-view-btn').prop('disabled', true);

        this.container.find('.conversation-creation-btn').toggleClass('d-none');
    }

    disableConversationCreation() {
        this.container.find('.conversation-selector').prop('disabled', false);
        this.contact.displayData(`#${this.container.get(0).id}`, true);
        this.container.find('.conversation-creation-btn').toggleClass('d-none'); 
        this.container.find('.contact-view-btn').prop('disabled', false);
    }

    createConversation() {
        this.contact.conversations.push({
            topic: this.container.find('[data-contact-info="conversations"] input[data-contact-info="topic"]').val(),
            text: this.container.find('[data-contact-info="conversations"] input[data-contact-info="text"]').val(),
            isUnsaved: true
        });
    }

    open() {
        // Exibe as informações do contato
        this.contact.displayData(`#${this.container.get(0).id}`);

        // Cria os eventos
        this.container.find('.conversation-selector').off().on('change', this.switchConversation.bind(this));
        
        this.buttons.edit.off().on('click', function() {
            this.enableEdition();
            this.toggleButtons();
        }.bind(this));

        this.buttons.cancel.off().on('click', function() {
            this.disableEdition();
            this.toggleButtons();
        }.bind(this));

        this.container.off().on('input', 'input[data-contact-info]', this.verifyInputFilling.bind(this))

        this.container.on('input', '[data-contact-info="conversations"] [data-contact-info]', this.preSaveConversationChanges.bind(this));

        this.buttons.save.off().on('click', function() {
            this.saveChanges();
            this.disableEdition();
            this.contact.displayData(`#${this.container.get(0).id}`);
            this.toggleButtons();
            displayContacts();
        }.bind(this));

        this.buttons.createConversation.off().on('click', this.enableConversationCreation.bind(this));

        this.buttons.cancelConversation.off().on('click', this.disableConversationCreation.bind(this));

        this.buttons.saveConversation.off().on('click', function() {
            this.createConversation();
            this.contact.displayData(`#${this.container.get(0).id}`, true);
            this.disableConversationCreation();
        }.bind(this));

        this.container.find('button.btn-close[data-bs-dismiss="modal"]').off().on('click', function() {
            const editionInputs = this.container.find('input[data-contact-info]');

            if (editionInputs.length) {
                if (!this.buttons.saveConversation.parent().hasClass('d-none')) {
                    this.disableConversationCreation();
                }
                this.disableEdition();
                this.toggleButtons();
            }

        }.bind(this));
    }
}