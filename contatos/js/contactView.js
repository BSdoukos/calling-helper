class ContactView {
    constructor(contact, container) {
        this.contact = contact;
        this.container = container;
        this.editableElements = ['name', 'number', 'topic', 'text'].map((info) => $(`[data-contact-info="${info}"]`));
        this.buttons = {
            edit: this.container.find('.edit-contact-btn'),
            cancel: this.container.find('.cancel-contact-changes-btn'),
            save: this.container.find('.save-contact-changes-btn'),
            createConversation: this.container.find('.create-conversation-btn'),
            cancelConversation: this.container.find('.cancel-conversation-btn'),
            saveConversation: this.container.find('.save-conversation-btn'),
            deleteConversation: this.container.find('.delete-conversation-btn')
        }
    }

    switchConversation() {
        this.prepareEdition();

        const select = $('#contactModal .conversation-selector');
        const contact = this.container.find('input[data-contact-info]').length ? Contact.createFrom(this.editedContact) : this.contact;

        contact.displayData(`#${this.container.get(0).id}`, false, select.find(`option:contains("${select.val()}")`).index());
    }

    prepareEdition() {
        if (!this.editedContact) {
            this.editedContact = $.extend(true, {}, this.contact);
        }
    }

    enableEdition() {
        this.editableElements.forEach((el) => {
            const inputType = el.attr('data-contact-info') === 'number' ? 'tel' : 'text';      
            el.replaceWith(`<input type="${inputType}" value="${el.text()}" class="form-control mt-2 mb-3" data-contact-info="${el.data('contact-info')}"></input>`);
        });
    }

    disableEdition() {
        const editedElements = this.container.find('input[data-contact-info]');

        editedElements.each((i, el) => {
            el.replaceWith(this.editableElements[i].get(0));
        });

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

    saveChanges() {
        this.prepareEdition();

        this.container.find('[data-contact-info]').each(function(i, el) {
            const elementLabel = el.getAttribute('data-contact-info');

            if (['conversations', 'topic', 'text'].every((label) => elementLabel !== label)) {
                if (el.tagName === 'INPUT') {
                    this.editedContact[elementLabel] = el.value;
                } else {
                    this.editedContact[elementLabel] = el.innerText;
                }
            }
        }.bind(this));

        Contact.remove(this.contact.id);
        this.contact = Contact.createFrom(this.editedContact);
        delete this.editedContact;
        this.contact.save();
    }

    enableConversationCreation() {
        const select = this.container.find('.conversation-selector');
        const newConversation = this.contact.conversations.length === 1 ? '1ª revisita' : `${this.contact.conversations.length}ª revisita`;

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
        this.container.find('.conversation-creation-btn').toggleClass('d-none'); 
        this.container.find('.contact-view-btn').prop('disabled', false);
    }

    createConversation() {
        this.prepareEdition();

        this.editedContact.conversations.push({
            topic: this.container.find('[data-contact-info="conversations"] input[data-contact-info="topic"]').val(),
            text: this.container.find('[data-contact-info="conversations"] input[data-contact-info="text"]').val(),
        });
    }

    deleteConversation() {
        this.prepareEdition();
        this.editedContact.conversations.pop();
    }

    open() {
        // Exibe as informações do contato
        this.contact.displayData(`#${this.container.get(0).id}`);

        // Cria os eventos
        this.container.find('.conversation-selector').off().on('change', function() {
            this.switchConversation();

            const select = this.container.find('.conversation-selector');

            if (this.container.find('input[data-contact-info]').length) {
                if (select.find('option').get().indexOf(select.find(`option:contains("${select.val()}")`)[0]) !== select.find('option').length - 1) {
                    this.buttons.deleteConversation.prop('disabled', true);
                } else {
                    this.buttons.deleteConversation.prop('disabled', false);
                }
            }
        }.bind(this));
        
        this.buttons.edit.off().on('click', function() {
            this.enableEdition();
            this.toggleButtons();
        }.bind(this));

        this.buttons.cancel.off().on('click', function() {
            this.disableEdition();
            this.toggleButtons();
        }.bind(this));

        this.container.off().on('input', 'input[data-contact-info]', this.verifyInputFilling.bind(this))

        this.buttons.save.off().on('click', function() {
            this.saveChanges();
            this.disableEdition();
            this.contact.displayData(`#${this.container.get(0).id}`);
            this.toggleButtons();
            displayContacts();
        }.bind(this));

        this.buttons.createConversation.off().on('click', this.enableConversationCreation.bind(this));

        this.buttons.cancelConversation.off().on('click', function() {
            this.disableConversationCreation();
            this.contact.displayData(`#${this.container.get(0).id}`, true);
        }.bind(this));

        this.buttons.saveConversation.off().on('click', function() {
            this.createConversation();
            Contact.createFrom(this.editedContact).displayData(`#${this.container.get(0).id}`, true);
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

        this.buttons.deleteConversation.off().on('click', function() {
            this.deleteConversation();
            Contact.createFrom(this.editedContact).displayData(`#${this.container.get(0).id}`, true);
        }.bind(this));
    }
}