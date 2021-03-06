class ListHandler {
    constructor() {
        this.lists = localStorage.getItem('phoneLists') ? JSON.parse(localStorage.getItem('phoneLists')) : undefined;
    }

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

class Contact {
    constructor(name, number, lastCall, remarks, conversations, id = Date.now()) {
        this.name = name;
        this.number = number;
        this.lastCall = lastCall;
        this.remarks = remarks;
        this.conversations = conversations;
        this.id = id;
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

    updateLists() {
        const listing = new ListHandler();
        
        listing.lists.forEach((list) => {
            const currentRelatedTel = list.numbers.filter((tel) => tel.status === this.id)[0];
            const correctRelatedTel = list.numbers.filter((tel) => tel.number === this.number)[0];
            if (currentRelatedTel) {
                listing.editPhoneNumber(list.name, currentRelatedTel.number, 'status', '-');
            }
            if (correctRelatedTel) {
                listing.editPhoneNumber(list.name, correctRelatedTel.number, 'status', this.id);
            }
        });
    }

    save() {
        if (!localStorage.getItem('contacts')) {
            localStorage.setItem('contacts', JSON.stringify([]));
        }

        this.conversations.forEach((conv) => {
            for (const key in conv) {
                conv[key] = conv[key] || 'Nenhum(a)';
            }
        });

        const contacts = JSON.parse(localStorage.getItem('contacts'));
        const newContact = {name: this.name || 'Sem nome', number: this.number, lastCall: this.lastCall, remarks: this.remarks || 'Nenhum(a)', conversations: this.conversations, id: this.id};

        contacts.push(newContact);
        
        localStorage.setItem('contacts', JSON.stringify(contacts));

        this.updateLists();
    }

    displayData(mainElementSelector, onlyConversations = false, conversationIndex = this.conversations.length - 1) {
        Array.from($(mainElementSelector).get(0).querySelectorAll('[data-contact-info]')).forEach((el) => {
            const dataContactInfo = el.getAttribute('data-contact-info');

            if (this[dataContactInfo]) {
                if (dataContactInfo !== 'conversations' && !onlyConversations) {
                    if (el.tagName !== 'INPUT') {
                        const content = dataContactInfo === 'number' ? `<a href="tel:${this[dataContactInfo].replace(/\(\d{2}\)\s/g, '').replace('-', '')}">${this[dataContactInfo]}</a>` : this[dataContactInfo];
                        el.innerHTML = content;
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
                    conversationName = `${i}?? revisita`;
                } else {
                    conversationName = '1?? conversa';
                }
    
                conversationSelector.append(`<option>${conversationName}</option>`)
            }
        });

        $(conversationSelector.find('option')[conversationIndex]).prop('selected', true);
    }
}

Object.defineProperties(Contact, {
    createFrom: {
        value: function(obj) {
            if (['name', 'number', 'lastCall', 'conversations'].every((prop) => obj[prop])) {
                obj.remarks = obj.remarks || 'Nenhum(a)';
                return new Contact(obj.name, obj.number, obj.lastCall, obj.remarks, obj.conversations);
            }
        }
    },
    get: {
        value: function(id) {
            const storedData = JSON.parse(localStorage.getItem('contacts')).filter((contact) => contact.id === id)[0];
    
            return !storedData ? storedData : new Contact(storedData.name, storedData.number, storedData.lastCall, storedData.remarks, storedData.conversations, storedData.id);
        }
    },
    remove: {
        value: function(id) {
            const contacts = JSON.parse(localStorage.getItem('contacts'));
            const requestedContact = contacts.filter((contact) => contact.id === id)[0];
    
            contacts.splice(contacts.indexOf(requestedContact), 1);
    
            localStorage.setItem('contacts', JSON.stringify(contacts));
        }
    }
});
class Timing {
    constructor() {
        this.begin;
        this.pauses = [];
        this.isPaused = false;
        this.time = {hours: 0, minutes: 0, seconds: 0};
    }

    start() {
        this.begin = Date.now();
    }
    
    update() {
        let pauses = 0;
        this.pauses.forEach((pause) => pauses += pause.duration);

        if (isNaN(pauses)) {
            return;
        }

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
        this.isPaused = true;
        this.pauses.push({begin: Date.now()});
    }

    resume() {
        this.isPaused = false;
        const lastPause = this.pauses[this.pauses.length - 1];

        lastPause.end = Date.now();
        lastPause.duration = lastPause.end - lastPause.begin;
    }

    save() {
        sessionStorage.setItem('timing', JSON.stringify(this));
    }
}

Object.defineProperties(Timing, {
    HOUR: {
        value: 3600000
    },
    MINUTE: {
        value: 60000
    },
    SECOND: {
        value: 1000
    },
    clearSaved: {
        value: function() {
            timing = null;
            sessionStorage.removeItem('timing');
        }
    },
    getSaved: {
        value: function() {
            const savedTiming = sessionStorage.getItem('timing') ? JSON.parse(sessionStorage.getItem('timing')) : null;
            if (savedTiming) {
                const timingObj = new Timing();
        
                for (const key in savedTiming) {
                    timingObj[key] = savedTiming[key];
                }
        
                return timingObj;
            }
        }
    }
});

class Report {
    constructor(isNew, publications, videos, returnVisits, time) {
        this.isNew = isNew;
        this.time = {hours: parseInt(time.hours), minutes: parseInt(time.minutes)};
        this.publications = parseInt(publications);
        this.videos = parseInt(videos);
        this.returnVisits = parseInt(returnVisits);
        this.month = Report.currentMonth;
    }
    
    save() {
        let reports = localStorage.getItem('reports');

        if (!reports) {
            localStorage.setItem('reports', JSON.stringify([]));
        }

        reports = JSON.parse(localStorage.getItem('reports'));
        const currentReport = reports.filter((report) => report.month === this.month)[0];

        if (!currentReport) {
            this.isNew = true;
        }

        if (this.isNew) {
            reports.push({
                month: this.month,
                hours: this.time.hours,
                minutes: this.time.minutes,
                publications: this.publications,
                videos: this.videos,
                returnVisits: this.returnVisits
            });
        } else {
            reports[reports.indexOf(currentReport)] = {
                month: currentReport.month,
                hours: currentReport.hours += this.time.hours,
                minutes: currentReport.minutes += this.time.minutes,
                publications: currentReport.publications += this.publications,
                videos: currentReport.videos += this.videos,
                returnVisits: currentReport.returnVisits += this.returnVisits
            };
        }

        localStorage.setItem('reports', JSON.stringify(reports));
    }
}

Object.defineProperties(Report, {
    currentMonth: {
        value: `${new Array("Janeiro", "Fevereiro", "Mar??o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro")[new Date().getMonth()].toString().toLowerCase()}-${new Date().getFullYear()}`
    },
    redefine: {
        value: function() {
            let reports = localStorage.getItem('reports');

            if (reports) {
                reports = JSON.parse(reports);
                reports.pop();
                localStorage.setItem('reports', JSON.stringify(reports));
                new Report(true, 0, 0, 0, {hours: 0, minutes: 0}).save();
            }
        }
    }
});

class Scheduling {
    constructor(contact, topic, date, time, id = Date.now()) {
        this.data = {contact, topic, date, time, id};
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

        function formatDateAsDefault() {
            return `${date.day}/${date.month}/${date.year}`;
        }

        if (parseInt(date.year) === actualDate.getFullYear() && parseInt(date.month) === actualDate.getMonth() + 1) {
            switch (parseInt(date.day)) {
                case actualDate.getDate():
                    date.interpretedDate = 'Hoje';
                    break;
                
                case actualDate.getDate() + 1:
                    date.interpretedDate = 'Amanh??';
                    break;

                case actualDate.getDate() - 1:
                    date.interpretedDate = 'Ontem';
                    break;
                
                default:
                    date.interpretedDate = formatDateAsDefault();
            }
        } else {
            date.interpretedDate = formatDateAsDefault();
        }

        return date;
    }

    conclude(text) {
        const settings = JSON.parse(localStorage.getItem('settings'));
        const relatedContact = Contact.get(this.data.contact.id);
        
        if (settings.contactsScheduledSync && relatedContact) {
            const date = new Date();

            const timeData = {
                day: date.getDate(),
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                hours: date.getHours(),
                minutes: date.getMinutes()
            };
    
            for (const n in timeData) {
                if (timeData[n] < 10) {
                    timeData[n] = '0' + timeData[n];
                }
            }
     
            relatedContact.lastCall = `${timeData.day}/${timeData.month}/${timeData.year} ${timeData.hours}:${timeData.minutes}`;
            relatedContact.conversations.push({
                topic: this.data.topic,
                text
            });
    
            Contact.remove(this.data.contact.id);
            relatedContact.save();
        }

        Scheduling.remove(this.id);

        if (settings.scheduledReportsSync) {
            new Report(!!localStorage.getItem('report'), 0, 0, 1, {hours: 0, minutes: 0}).save();
        }

    }

    getSharingInfo() {
        return encodeURIComponent(`Nome: ${this.data.contact.name}\nTelefone: ${this.data.contact.number}\nTema da conversa: ${this.data.topic}\nData: ${this.getDate().interpretedDate}\nHor??rio: ${this.data.time}\nObserva????es: ${this.data.contact.remarks || 'Nenhum(a)'}`);
    }
}

Object.defineProperties(Scheduling, {
    createFrom: {
        value: function(schedulingData) {
            if (['contact', 'date', 'time', 'id'].every((prop) => schedulingData[prop])) {
                schedulingData.topic = schedulingData.topic || 'Nenhum(a)';
                return new Scheduling(schedulingData.contact, schedulingData.topic, schedulingData.date, schedulingData.time, schedulingData.id);
            }
        }
    },
    get: {
        value: function(id) {
            const storedData = JSON.parse(localStorage.getItem('schedule')).filter((scheduling) => scheduling.id === id)[0];

            return Scheduling.createFrom(storedData);
        }
    },
    remove: {
        value: function(id) {
            const schedule = JSON.parse(localStorage.getItem('schedule'));
            const requestedScheduling = schedule.filter((scheduling) => scheduling.id === id)[0];
    
            schedule.splice(schedule.indexOf(requestedScheduling), 1);
    
            localStorage.setItem('schedule', JSON.stringify(schedule));
        }
    }
});

(function() {
    let scheduled = localStorage.getItem('schedule');

    if (scheduled) {
        scheduled = JSON.parse(scheduled);

        const scheduledForToday = scheduled.filter((sch) => Date.parse(sch.date) <= Date.parse(new Date().toISOString().slice(0, -14)));

        if (scheduledForToday.length) {
            $('.scheduled-calls-badge').text(scheduledForToday.length);
        }
    }


    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            listsContactsSync: true,
            contactsScheduledSync: true,
            scheduledReportsSync: true
        }));
    }
})();