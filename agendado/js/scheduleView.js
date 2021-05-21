class ScheduleView {
    constructor(container) {
        this.container = $(container);
    }

    appendCollapsibleItem(itemData) {
        const itemContact = Contact.get(itemData.contact);
        const scheduling = Scheduling.createFrom(itemData);
        const index = this.container.find('.accordion-item').length + 1;

        this.container.append(`
            <div class="accordion-item mb-3">
                <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                    <span class="me-2">${itemContact.name}</span> - <span class="mx-2">${scheduling.getDate().interpretedDate} - ${scheduling.data.time}</span>
                </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#scheduledCallsContainer">
                    <div class="accordion-body text-start">
                        <div class="mb-3">
                            <h3 class="h6 fw-bold mb-1">Telefone</h3>
                            <p>${itemContact.number}</p>
                        </div>
                        <div class="mb-2">
                            <h3 class="h6 fw-bold mb-1">Tema da conversa</h3>
                            <p class="mb-0">${scheduling.data.topic}</p>
                        </div>
                        <a href="tel:55${itemContact.number.replace(/[\(\) -]/g, '')}" class="btn btn-primary pt-1 d-md-none">Ligar</a>
                    </div>
                </div>
            </div>
        `);
    }

    fillContainer(scheduledCalls) {
        this.container.html('');
        this.container.removeClass('d-none');

        scheduledCalls.forEach((item) => {
            this.appendCollapsibleItem(item);
        });
    }

    displayContactOptions() {
        let contacts = localStorage.getItem('contacts');

        if (contacts) {
            contacts = JSON.parse(contacts);
        } else {
            return;
        }

        const select = $('#scheduledTalkContactSelector');
        const neutralOption = select.find('option:contains("Selecionar")')[0];

        select.empty();
        select.append(neutralOption);

        contacts.forEach((contact) => {
         select.append(`
                <option value="${contact.id}">${contact.name} - ${contact.number}</option>
            `);
        });
    }

    createScheduling() {
        new Scheduling(parseInt($('#scheduledTalkContactSelector').val()), $('#scheduledTalkTopic').val(), $('#scheduledTalkDate').val(), $('#scheduledTalkTime').val()).save();
    }

    init() {
        let scheduledCalls = localStorage.getItem('schedule');

        $('.main-content').removeClass('d-none');
        $('#mainSpinner').remove();

        if (scheduledCalls) {   
            scheduledCalls = JSON.parse(scheduledCalls);

            if (scheduledCalls.length) {
                this.fillContainer(scheduledCalls);
            } else {
                $('#noScheduleInfo').removeClass('d-none');
            }  
        } else {
            $('#noScheduleInfo').removeClass('d-none');
        }

        this.displayContactOptions();

        // Eventos

        $('#submitSchedulingBtn').off().on('click', function() {
            this.createScheduling();
            this.init();
        }.bind(this));
    }
}