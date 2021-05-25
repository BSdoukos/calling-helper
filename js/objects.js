class Contact {
    constructor(name, number, lastCall, conversations, id = Date.now()) {
        this.name = name;
        this.number = number;
        this.lastCall = lastCall;
        this.conversations = conversations;
        this.id = id;
    }

    static createFrom(obj) {
        if (['name', 'number', 'lastCall', 'conversations'].every((prop) => obj[prop])) {
            return new Contact(...Object.values(obj));
        }
    }

    static get(id) {
        const storedData = JSON.parse(localStorage.getItem('contacts')).filter((contact) => contact.id === id)[0];

        return new Contact(storedData.name, storedData.number, storedData.lastCall, storedData.conversations, storedData.id);
    }

    static remove(id) {
        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const requestedContact = contacts.filter((contact) => contact.id === id)[0];

        contacts.splice(contacts.indexOf(requestedContact), 1);

        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    merge(contact2, conflictSolutionType = 'replace') {
        if (conflictSolutionType === 'replace') {
            this.name = contact2.name;
            this.number = contact2.number;
            this.lastCall = contact2.lastCall;
        }

        contact2.conversations.forEach((conv, i) => {
            if (this.conversations[i] === undefined || (conflictSolutionType === 'replace' && conv !== undefined)) {
                this.conversations[i] = conv;
            }
        });

        return this;
    }

    save() {
        if (!localStorage.getItem('contacts')) {
            localStorage.setItem('contacts', JSON.stringify([]));
        }

        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const newContact = {name: this.name, number: this.number, lastCall: this.lastCall, conversations: this.conversations, id: this.id};

        contacts.push(newContact);
        
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }

    displayData(mainElementSelector, onlyConversations = false, conversationIndex = this.conversations.length - 1) {
        Array.from($(mainElementSelector).get(0).querySelectorAll('[data-contact-info]')).forEach((el) => {
            const dataContactInfo = el.getAttribute('data-contact-info');

            if (this[dataContactInfo]) {
                if (dataContactInfo !== 'conversations' && !onlyConversations) {
                    if (el.tagName !== 'INPUT') {
                        el.innerText = this[dataContactInfo];
                    } else {
                        el.value = this[dataContactInfo];
                    }
                } else {
                    const conversationsElements = $(el).find('[data-contact-info]');

                    conversationsElements.each(function(_i, element) {
                        const content = this.conversations[conversationIndex][$(element).attr('data-contact-info')];
                        if (content) {
                            if (element.tagName !== 'INPUT') {
                                $(element).text(content);
                            } else {
                                $(element).val(content);
                            }
                        }
                    }.bind(this));
                }
            }
        });

        const conversationSelector = $(mainElementSelector).find('.conversation-selector');

        conversationSelector.html('');

        this.conversations.forEach((conv, i) => {      
            if (conv !== 'deleted') {
                let conversationName;

                if (i > 0) {
                    conversationName = `${i}ª revisita`;
                } else {
                    conversationName = '1ª conversa';
                }
    
                conversationSelector.append(`<option>${conversationName}</option>`)
            }
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

            localStorage.setItem('report', JSON.stringify({
                publications: report.publications,
                videos: report.videos,
                returnVisits: report.returnVisits,
                time: report.time
            }));
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

class Scheduling {
    constructor(contact, topic, date, time, id = Date.now()) {
        this.data = {contact, topic, date, time, id};
    }

    static createFrom(schedulingData) {
        if (['contact', 'topic', 'date', 'time', 'id'].every((prop) => schedulingData[prop])) {
            return new Scheduling(schedulingData.contact, schedulingData.topic, schedulingData.date, schedulingData.time, schedulingData.id);
        }
    }

    static get(id) {
        const storedData = JSON.parse(localStorage.getItem('schedule')).filter((scheduling) => scheduling.id === id)[0];

        return Scheduling.createFrom(storedData);
    }

    static remove(id) {
        const schedule = JSON.parse(localStorage.getItem('schedule'));
        const requestedScheduling = schedule.filter((scheduling) => scheduling.id === id)[0];

        schedule.splice(schedule.indexOf(requestedScheduling), 1);

        localStorage.setItem('schedule', JSON.stringify(schedule));
    }


    save() {
        let schedule = localStorage.getItem('schedule');

        if (!schedule) {
            schedule = [];
        } else {
            schedule = JSON.parse(schedule);
        }

        schedule.push(this.data);

        localStorage.setItem('schedule', JSON.stringify(schedule));
    }

    getDate() {
        const date = {
            year: this.data.date.substr(0, 4),
            month: this.data.date.substr(5, 2),
            day:  this.data.date.substr(8, 2)
        }

        const actualDate = new Date();

        if (parseInt(date.year) === actualDate.getFullYear() && parseInt(date.month) === actualDate.getMonth() + 1) {
            switch (parseInt(date.day)) {
                case actualDate.getDate():
                    date.interpretedDate = 'Hoje';
                    break;
                
                case actualDate.getDate() + 1:
                    date.interpretedDate = 'Amanhã';
                    break;

                case actualDate.getDate() - 1:
                    date.interpretedDate = 'Ontem';
                    break;
                
                default:
                    date.interpretedDate = `${date.day}/${date.month}/${date.year}`;
            }
        }

        return date;
    }

    conclude(text) {
        const relatedContact = Contact.get(this.data.contact);

        relatedContact.conversations.push({
            topic: this.data.topic,
            text
        });

        Contact.remove(this.data.contact);
        relatedContact.save();

        Scheduling.remove(this.id);

        let reportIsNew = true;
        if (localStorage.getItem('report')) {
            reportIsNew = false;
        }

        new Report(reportIsNew, 0, 0, 1, {hours: 0, minutes: 0}).save();
    }
}