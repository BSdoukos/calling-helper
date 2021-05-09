class Contact {
    constructor(name, number, lastCall, conversations, id = Date.now()) {
        this.name = name;
        this.number = number;
        this.lastCall = lastCall;
        this.conversations = conversations;
        this.id = id;
    }

    static get(id) {
        const storedData = JSON.parse(localStorage.getItem('contacts')).filter((contact) => contact.id === id)[0];

        return new Contact(storedData.name, storedData.number, storedData.lastCall, storedData.conversations, storedData.id);
    }

    save() {
        if (!localStorage.getItem('contacts')) {
            localStorage.setItem('contacts', JSON.stringify([]));
        }

        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const newContact = {name: this.name, number: this.number, lastCall: this.lastCall, conversations: this.conversations, id: this.id};
        const oldContact = contacts.some((contact) => contact.name === newContact.name);

        if (oldContact) {
            contacts.splice(contacts.indexOf(oldContact), contacts.indexOf(oldContact) + 1)
        }

        contacts.push(newContact);
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    displayData(mainElementSelector, conversationIndex = this.conversations.length - 1) {
        Array.from($(mainElementSelector).get(0).querySelectorAll('[data-contact-info]')).forEach((el) => {
            const dataContactInfo = el.getAttribute('data-contact-info');

            if (this[dataContactInfo]) {
                if (dataContactInfo !== 'conversations') {
                    el.innerText = this[dataContactInfo];
                } else {
                    const conversationsElements = $(el).find('[data-contact-info]');

                    conversationsElements.each(function(_i, element) {
                        $(element).text(this.conversations[conversationIndex][$(element).attr('data-contact-info')]);
                    }.bind(this));
                }
            }
        });

        const conversationSelector = $(mainElementSelector).find('.conversation-selector');

        conversationSelector.html('');

        this.conversations.forEach((conv, i) => {      
            let conversationName;

            if (i > 0) {
                conversationName = `${i}ª revisita`;
            } else {
                conversationName = '1ª conversa';
            }

            conversationSelector.append(`<option>${conversationName}</option>`)
        });

        $(conversationSelector.find('option')[conversationIndex]).prop('selected', true);
    }
}

class Timing {
    constructor() {
        this.begin;
        this.pauses = [];
        this.time = {hours: 0, minutes: 0, seconds: 0};
    }

    static HOUR = 3600000;
    static MINUTE = 60000;
    static SECOND = 1000;

    start() {
        this.begin = Date.now();
    }
    
    update() {
        let pauses = 0;
        this.pauses.forEach((pause) => pauses += pause.duration);

        const elapsedTime = Date.now() - this.begin - pauses;

        this.time.hours = Math.floor(elapsedTime / Timing.HOUR);
        this.time.minutes = Math.floor(elapsedTime % Timing.HOUR / Timing.MINUTE);
        this.time.seconds = Math.floor(elapsedTime % Timing.HOUR % Timing.MINUTE / Timing.SECOND);
    }

    format() {
        const hours = this.time.hours < 10 ? `0${this.time.hours}` : this.time.hours;
        const minutes = this.time.minutes < 10 ? `0${this.time.minutes}` : this.time.minutes;
        const seconds = this.time.seconds < 10 ? `0${this.time.seconds}` : this.time.seconds;

        return `${hours}:${minutes}:${seconds}`;
    }

    pause() {
        this.pauses.push({begin: Date.now()});
    }

    resume() {
        const lastPause = this.pauses[this.pauses.length - 1];

        lastPause.end = Date.now();
        lastPause.duration = lastPause.end - lastPause.begin;
    }
}

class Report {
    constructor(isNew, publications, videos, returnVisits, time) {
        this.isNew = isNew;
        this.time = time;
        this.publications = publications;
        this.videos = videos;
        this.returnVisits = returnVisits;
    }

    save() {
        if (this.isNew) {
            localStorage.setItem('report', JSON.stringify({
                time: this.time,
                publications: this.publications,
                videos: this.videos,
                returnVisits: this.returnVisits
            }));
        } else {
            const report = JSON.parse(localStorage.getItem('report'));

            report.time.hours += this.time.hours;
            report.time.minutes += this.time.minutes;
            report.publications += this.publications;
            report.videos += this.videos;
            report.returnVisits += this.returnVisits;

            localStorage.setItem('report', JSON.stringify(report));
        }
    }
}

class ListHandler {
    constructor() {}

    getPhoneNumber(list, number) {
        const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        const list_ = phoneLists.filter((phoneList) => phoneList.name === list)[0];

        let requestedNumber;
        list_.numbers.forEach((tel) => {
            if (tel.number === number) {
                requestedNumber = tel;
            }
        });

        return requestedNumber;
    }

    editPhoneNumber(list, number, property, content) {
        const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        const list_ = phoneLists.filter((phoneList) => phoneList.name === list)[0];
        const listIndex = phoneLists.indexOf(list_);
        
        list_.numbers.forEach((tel) => {
            if (tel.number === number) {
                tel[property] = content;
            }
        });
        phoneLists[listIndex] = list_;

        localStorage.setItem('phoneLists', JSON.stringify(phoneLists));
    }

    deletePhoneNumber(list, number) {
        const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        const list_ = phoneLists.filter((phoneList) => phoneList.name === list)[0];
        const listIndex = phoneLists.indexOf(list_);

        list_.numbers = list_.numbers.filter((tel) => tel.number !== number);
        phoneLists[listIndex] = list_;

        localStorage.setItem('phoneLists', JSON.stringify(phoneLists));
    }

    editList(list, property, content) {
        const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        const list_ = phoneLists.filter((phoneList) => phoneList.name === list)[0];
        const listIndex = phoneLists.indexOf(list_);

        list_[property] = content;
        phoneLists[listIndex] = list_;

        localStorage.setItem('phoneLists', JSON.stringify(phoneLists));
    }
}

class ContactList {
    constructor(){}

    get() {
        const contacts = JSON.parse(localStorage.getItem('contacts'));

        if (contacts) {
            const names = contacts.map((contact) => contact.name).sort();
            let sortedContacts;
    
            names.forEach((name) => {
                sortedContacts.push(contacts.filter((contact) => contact.name === name)[0]);
            });
    
            return sortedContacts;
        }
    }
}