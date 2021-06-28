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
                            <a href="tel:${scheduling.data.contact.number.replace(/\(\d{2}\)\s/g, '').replace('-', '')}">${scheduling.data.contact.number}</a>
                        </div>
                        <div class="mb-3">
                            <h3 class="h6 fw-bold mb-1">Tema da conversa</h3>
                            <p class="mb-0">${scheduling.data.topic}</p>
                        </div>
                        <div class="mb-2">
                        <h3 class="h6 fw-bold mb-2">Compartilhar</h3>
                            <a href="whatsapp://send?text=${scheduling.getSharingInfo()}" class="text-decoration-none text-success me-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" fill="currentColor" class="bi bi-whatsapp" viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                                </svg>
                            </a>
                            <a href="mailto:example@mail.com?subject=Posso lhe passar uma revisita?&body=${scheduling.getSharingInfo()}" class="text-decoration-none me-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.65em" height="1.65em" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16">
                                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.758 2.855L15 11.114v-5.73zm-.034 6.878L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.739zM1 11.114l4.758-2.876L1 5.383v5.73z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    fillContainer(scheduledCalls) {
        this.container.removeClass('d-none');

        scheduledCalls.sort((a, b) => {
            const splittedDates = [a, b].map((sch) => sch.date.split('-'));
            return new Date(splittedDates[0][2], splittedDates[0][1] - 1, splittedDates[0][0]) >= new Date(splittedDates[1][2], splittedDates[1][1] - 1, splittedDates[1][0]);
        });

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
                textInput.val('Nenhum(a)');
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

        $('#submitSchedulingBtn').prop('disabled', true);
        $('#scheduleCallModal input, #scheduleCallModal select').on('input', () => {
            PhoneListView.prototype.validateInput('simple', '#scheduleCallModal form');
        });
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