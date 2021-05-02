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

class Timing {
    constructor() {
        this.begin;
        this.time = {hours: 0, minutes: 0, seconds: 0};
    }

    static HOUR = 3600000;
    static MINUTE = 60000;
    static SECOND = 1000;

    start() {
        this.begin = Date.now();
    }
    
    update() {
        const elapsedTime = Date.now() - this.begin;

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

    // stop() {

    // }
}

// class DataAccess {
//     constructor() {
//         this.protocol = Date.now();
//     }

//     get() 
// }