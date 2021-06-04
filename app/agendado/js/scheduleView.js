class ScheduleView {
    constructor(container) {
        this.container = $(container);
        this.collapsedAreas = [];
    }

    appendCollapsibleItem(itemData) {
        const scheduling = Scheduling.createFrom(itemData);
        const index = this.container.find('.accordion-item').length + 1;

        this.container.append(`
            <div class="accordion-item mb-3" data-scheduling-id="${scheduling.data.id}">
                <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                    <span class="me-2">${scheduling.data.contact.name}</span> - <span class="mx-2">${scheduling.getDate().interpretedDate} - ${scheduling.data.time}</span>
                </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#scheduledCallsContainer">
                    <div class="accordion-body text-start">
                        <div class="mb-3">
                            <h3 class="h6 fw-bold mb-1">Telefone</h3>
                            <p>${scheduling.data.contact.number}</p>
                        </div>
                        <div class="mb-2">
                            <h3 class="h6 fw-bold mb-1">Tema da conversa</h3>
                            <p class="mb-0">${scheduling.data.topic}</p>
                        </div>
                        <a href="tel:55${scheduling.data.contact.number.replace(/[\(\) -]/g, '')}" class="btn btn-primary pt-1 d-md-none">Ligar</a>
                    </div>
                </div>
            </div>
        `);
    }

    fillContainer(scheduledCalls) {
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
        new Scheduling(Contact.get(parseInt($('#scheduledTalkContactSelector').val())), $('#scheduledTalkTopic').val(), $('#scheduledTalkDate').val(), $('#scheduledTalkTime').val()).save();
    }

    toggleButtons() {   
        $('#createSchedulingBtn').toggleClass('d-none');
        $('#editScheduleBtn').toggleClass('d-none');
        $('.schedule-edition-btn').toggleClass('d-none');
        $('#deleteSchedulingBtn, #concludeScheduledCallBtn').prop('disabled', true);
    }

    enableEdition() {
        this.container.find('.accordion-button').addClass('onedition').append('<input type="checkbox" name="scheduling" class="ms-auto scheduling-selection-checkbox">');
        this.container.find('.accordion-collapse').removeClass('show');

        const collapsedAreas = [];

        this.container.find('.accordion-button').off().on('click', function(e) {
            const checkbox = $(this).find('.scheduling-selection-checkbox');
            
            if(e.target !== checkbox.get(0)) {
                checkbox.prop('checked', !checkbox.prop('checked'));
            }

            collapsedAreas.push($(this).parent().siblings('.accordion-collapse').remove()[0]);
        });

        return collapsedAreas;
    }

    disableEdition() {
        this.container.find('.accordion-item').get().forEach((el, i) => {
            if (this.collapsedAreas[i]) {
                this.collapsedAreas[i].classList.remove('show');
                el.append(this.collapsedAreas[i])
            }
        });

        this.container.find('.accordion-button').removeClass('onedition').addClass('collapsed').off();
        this.container.find('.scheduling-selection-checkbox').remove();
    }

    getSelection() {
        return this.container.find('.scheduling-selection-checkbox:checked').get().map((checkbox) => parseInt($(checkbox).parents('.accordion-item').data('scheduling-id')));
    }

    showSchedulingDeletionAlert() {
        $('.undo-scheduling-deletion-btn').parent('.alert').removeClass('d-none').addClass('d-flex');

        clearTimeout(window.undoSchedulingDeletionTime);

        window.undoSchedulingDeletionTime = setTimeout(() => {
            $('.undo-scheduling-deletion-btn').parent('.alert').addClass('d-none').removeClass('d-flex');
        }, 10000);
    }

    setEvents() {
        $('#submitSchedulingBtn').off().on('click', function() {
            this.createScheduling();
            this.init();
        }.bind(this));

        $('#editScheduleBtn').off().on('click', function() {
            this.collapsedAreas = this.enableEdition();
            this.toggleButtons();
            
        }.bind(this));

        $('#cancelScheduleEditionBtn').off().on('click', function() {
            this.disableEdition();
            this.toggleButtons();
        }.bind(this));

        $(document).on('click', '#scheduledCallsContainer .accordion-item', function(e) {
            $('#deleteSchedulingBtn, #concludeScheduledCallBtn').prop('disabled', this.getSelection().length === 0);

            if (this.getSelection().length > 1) {
                $('#concludeScheduledCallBtn').prop('disabled', true);
            }
        }.bind(this));

        $('#deleteSchedulingBtn').off().on('click', function() {  
            window.recentlyDeletedScheduling = this.getSelection().map((id) => Scheduling.get(id));
            this.getSelection().forEach((id) => Scheduling.remove(id));
            this.toggleButtons();
            this.init();
            this.disableEdition();
            this.showSchedulingDeletionAlert();
        }.bind(this));

        $('.undo-scheduling-deletion-btn').off().on('click', function() {
            window.recentlyDeletedScheduling.forEach((scheduling) => scheduling.save());
            this.init();
            $('.undo-scheduling-deletion-btn').parent('.alert').removeClass('d-flex').addClass('d-none');
        }.bind(this));

        $('#noReadText').on('change', function() {
            const textInput = $(this).closest('.modal').find('#scheduledTalkText');

            textInput.prop('disabled', this.checked);

            if (this.checked) {
                textInput.val('Nenhum');
            } else {
                textInput.val('');
            }
        });

        $('#submitScheduledCallConclusionBtn').off().on('click', function() {
            const scheduling = Scheduling.get(this.getSelection()[0]);
            scheduling.conclude($('#submitScheduledCallConclusionBtn').closest('.modal').find('#scheduledTalkText').val());
            this.toggleButtons();
            this.init();
        }.bind(this));
    }

    init() {
        let scheduledCalls = localStorage.getItem('schedule');

        $('.main-content').removeClass('d-none');
        $('#mainSpinner').remove();
        this.container.html('');

        const noScheduleInfo = $('#noScheduleInfo');
        const editScheduleBtn = $('#editScheduleBtn');

        if (scheduledCalls) {   
            scheduledCalls = JSON.parse(scheduledCalls);

            if (scheduledCalls.length) {
                this.fillContainer(scheduledCalls);
                editScheduleBtn.removeClass('d-none');
                noScheduleInfo.addClass('d-none');

            } else {
                editScheduleBtn.addClass('d-none');
                this.container.addClass('d-none');
                noScheduleInfo.removeClass('d-none');
            }  

        } else {
            editScheduleBtn.addClass('d-none');
            this.container.addClass('d-none');
            noScheduleInfo.removeClass('d-none');
        }

        this.displayContactOptions();
        this.setEvents();
    }
}