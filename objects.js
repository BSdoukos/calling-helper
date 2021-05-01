class Contact {
    constructor(name, number, conversations) {
        this.name = name;
        this.number = number;
        this.conversations = conversations;
        this.id = Date.now();
    }

    save() {
        if (!localStorage.getItem('contacts')) {
            localStorage.setItem('contacts', JSON.stringify([]));
        }

        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const newContact = {name: this.name, number: this.number, conversations: this.conversations, id: this.id};
        const oldContact = contacts.some((contact) => contact.name === newContact.name);

        if (oldContact) {
            contacts.splice(contacts.indexOf(oldContact), contacts.indexOf(oldContact) + 1)
        }

        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }
}