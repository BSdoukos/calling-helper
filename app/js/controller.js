class PhoneListController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    displayLists() {
        const userData = this.model.getUserData();
        function calcListCompletionPercentage(list) {
            const calledNumbers = list.numbers.filter((number) => number.status !== '-');
            return Math.round(calledNumbers.length / list.numbers.length * 100);
        }

        $('#phoneListsDisplay').html('');
        userData.phoneLists.forEach((list) => {
            if (list) {
                this.view.displayListCard(list.name, list.numbers.length, calcListCompletionPercentage(list));
            }
        });
        
        $('.list-selection-checkbox').on('change', () => {
            app.view.validateInput('listSelection');
        }); 
    }

    displayUserData() {
        if (JSON.parse(localStorage.getItem('activeList')) === 'deleted') {
            this.view.clear();
            localStorage.removeItem('phoneLists');
            localStorage.removeItem('activeList');
            return;
        }

        const userData = this.model.getUserData();
        if (userData) {   
            this.view.displayPhoneList(userData.activeList.name, JSON.parse(localStorage.getItem('userData.activeList')));
            if (userData.activeList.numbers.length) {
                this.view.adaptPhoneList();

                userData.activeList.numbers.forEach((number) => {
                    if (['Inexistente', 'Cx. postal', 'Falha', 'Ocupado', 'Desligado/sem serviço', '-'].some((status) => status === number.status)) {
                        this.view.appendNumber(number.number, number.status, false);
                    } else {
                        const attachedContact = Contact.get(parseInt(number.status));
                        if (!attachedContact) {
                            new ListHandler().editPhoneNumber(userData.activeList.name, number.number, 'status', '-');
                            this.view.appendNumber(number.number, '-', false);
                            return;
                        }
                        this.view.appendNumber(number.number, `<a href="app/contatos/contatos.html?id=${attachedContact.id}" class="link-primary">${attachedContact.name}</a>`, false, attachedContact.id);
                    }
                });

                $(`.phone-table .number-cell:contains("${userData.activeList.currentNumber}")`).parent().addClass('current table-active');
                app.view.updateWorkContainer();
                this.displayLists();

                if (userData.activeList.isCompleted) {
                    const addNumbersBtn = $('#addNumbersBtn');

                    addNumbersBtn.attr('disabled', true);
                    addNumbersBtn.wrap(`
                        <span class="d-inline-block" tabindex="0" data-bs-toggle="popover" data-bs-trigger="hover focus" data-bs-placement="bottom" data-bs-content="Não é possível adicionar números a listas que já estão completas. Crie uma nova lista para adicionar novos números."></span>
                    `);

                    // Bootstrap script for initializing popovers
                        var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
                        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
                        return new bootstrap.Popover(popoverTriggerEl)
                    })
                }
            }
        } else {
            $('#listContainer .spinner-border').addClass('d-none');
            $('#noListsInfo').removeClass('hidden');
        }
    }

    createPhoneList() {
        this.view.displayPhoneList($('#listName').val());
        this.model.registerPhoneList();
    }

    fillPhoneList() {
        this.view.adaptPhoneList();
        if ($('#phoneNumber').val() !== '') {    
            this.view.appendNumber($('#phoneNumber').val(), '-');
            this.model.registerPhoneList();
        }
        if ($('#phoneNumberSequence').val() !== '') {
            const sequence = this.model.getNumbersSequence($('#phoneNumberSequence').val().split(' - '));
            
            sequence.forEach((number) => {
                this.view.appendNumber(number, '-');
                this.model.registerPhoneList();
            });
        }

        app.view.updateWorkContainer();
        this.displayLists();
    }

    setNumberCallTime() {
        const listData = new ListHandler();
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
        listData.editPhoneNumber($('#titleCell').text(), $('#currentNumber').text(), 'lastCall', `${timeData.day}/${timeData.month}/${timeData.year} ${timeData.hours}:${timeData.minutes}`);
    }

    changeNumberStatus(status) {
        this.view.displayNewNumberStatus(status);
        this.view.changeCurrentItem();
        this.model.registerPhoneList();
        this.setNumberCallTime();
        this.view.updateWorkContainer();
        this.displayLists();
    }

    openList(listName) {
        const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        const list = phoneLists.filter((list) => list.name === listName)[0];
        localStorage.setItem('activeList', JSON.stringify(phoneLists.indexOf(list)));

        this.displayUserData();
    }

    removeLists() {
        $('.list-selection-checkbox:checked').get().forEach((checkbox) => this.model.deleteList($(checkbox).siblings('.list-info').find('.list-title').text()));
        this.displayUserData();
    }

    registerContact(number = $('#currentNumber').text()) {
        this.setNumberCallTime();

        let contact;

        if (number !== $('#currentNumber').text()) {
            contact = this.model.createContact(number);
            this.view.displayNewNumberStatus(`<a class="link-primary">${contact.id}</a>`, number);
        } else {
            contact = this.model.createContact();
            this.view.displayNewNumberStatus(`<a class="link-primary">${contact.id}</a>`);
            this.view.changeCurrentItem();
        }
        
        this.model.registerPhoneList();
        this.view.updateWorkContainer();
        this.displayUserData();

        return contact;
    }

    deleteNumber() {
        const listsData = new ListHandler();

        if ($('#numberInfoTel').text() === $('#currentNumber').text()) {
            this.view.changeCurrentItem();
            listsData.editList($('#titleCell').text(), 'currentNumber', $('.phone-table tr.current .number-cell').text());
        }

        listsData.deletePhoneNumber($('#titleCell').text(), $('#numberInfoTel').text());

        this.displayUserData();
    }

    initCronometer(thereIsSavedTiming = false) {
        if (thereIsSavedTiming) {
            window.timing = Timing.getSaved();
        } else {
            window.timing = new Timing();
            timing.start();
        }
    
        window.updateCronometer = function() {
            timing.update();

            if (!$('#timingText').length) {
                $('#startTimingBtn').parent().append(`
                    <button class="btn text-secondary me-3 cronometer-btns" id="toggleTimingBtn">Pausar</button>
                    <p id="timingText" class="mb-0"></p>
                    <button class="btn text-danger ms-3 cronometer-btns" id="stopTimingBtn" data-bs-toggle="modal" data-bs-target="#timeReportingModal">Parar</button>
                `);
            }
    
            $('#timingText').text(timing.format());
    
            $('#startTimingBtn').css('display', 'none');  
        }

        updateCronometer();
        
        $('#toggleTimingBtn').on('click', function() {
            if (this.innerText === 'Pausar') {
                timing.pause();
                clearInterval(timingCounter);
                this.innerText = 'Continuar';
            } else {
                timing.resume();
                updateCronometer();
                window.timingCounter = setInterval(updateCronometer, 1000);
                this.innerText = 'Pausar';
            }
        });
        
        $(window).on('unload', () => {
            if (timing) {
                timing.save();
            }
        });
        
        $('#stopTimingBtn').on('click', function() {
            clearInterval(timingCounter);
            timing.update();
            $('#workedTime').text(`${timing.time.hours} horas e ${timing.time.minutes} minutos`);
            $('.cronometer-btns, #timingText').remove();
            $('#startTimingBtn').css('display', 'initial');
            timing = null;
            sessionStorage.removeItem('timing');
        });

        window.timingCounter = setInterval(updateCronometer, 1000);

        if (timing.isPaused) {
            clearInterval(timingCounter);
            $('#toggleTimingBtn').text('Continuar');
        }
    }
}