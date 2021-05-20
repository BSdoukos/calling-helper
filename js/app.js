const app = new PhoneListController(new PhoneListModel(), new PhoneListView());

app.displayUserData();

$('#listName').on('input', function() {
    app.view.validateInput('simple', '#newListModal form');
});
$('#phoneNumber, #phoneNumberSequence').on('input', function() {
    app.view.validateInput('phoneNumbers');
});

$('#submitListBtn').on('click', function(e) {
    e.preventDefault();
    app.createPhoneList();
    $('#newListModal').modal('hide');
});

$('#submitNumberBtn').on('click', function(e) {
    e.preventDefault();
    app.fillPhoneList();
    $('#addNumbersModal').modal('hide');
});

$('#submitStatusBtn').on('click', function() {
    if ($('#statusSelector').val() !== 'Sucesso' && $('#statusSelector').val() !== '-') {
        app.changeNumberStatus($('#statusSelector').val())
    } else {
        $('#contactCreationModal').modal('show');
    }
});

$('#openListBtn').on('click', function() {
    app.openList($('#phoneListsDisplay .list-selection-checkbox:checked').siblings('.list-info').find('.list-title').text());
});

$('#deleteListBtn').on('click', function() {
    app.removeLists();
});

$('#contactCreationModal input').on('input', function() {
    app.view.validateInput('simple', '#contactCreationModal form');
});

$('#unknownName').on('change', function() {
    const contactNameInput = $('#contactName');
    contactNameInput.val('Sem nome').attr('disabled', !contactNameInput.get(0).disabled);
});

$('#callAgain').on('change', function() {
    const nextTalkInputs = $('.next-talk-input').get();
    nextTalkInputs.forEach((input) => $(input).attr('disabled', !input.disabled).attr('aria-disabled', !$(input).attr('aria-disabled')));
});

$('#submitContactBtn').on('click', function(e) {
    e.preventDefault();

    const parentModal = $(this).parents('.modal');

    let contactID;
    
    if(parentModal.attr('data-related-number')) {
        contactID = app.registerContact(parentModal.attr('data-related-number')).id;
        parentModal.removeAttr('data-related-number')
    } else {
        contactID = app.registerContact().id;
    }

    if ($('#callAgain').prop('checked')) {
        new Scheduling(contactID, $('#nextTalkTopic').val(), $('#nextTalkDate').val(), $('#nextTalkTime').val()).save();
    }
});

$('#startTimingBtn').on('click', function() {
    window.timing = new Timing();
    timing.start();

    window.updateCronometer = function() {
        timing.update();

        if (!$('#timingText').length) {
            $(this).parent().append(`
                <button class="btn text-secondary me-3 cronometer-btns" id="toggleTimingBtn">Pausar</button>
                <p id="timingText" class="mb-0"></p>
                <button class="btn text-danger ms-3 cronometer-btns" id="stopTimingBtn" data-bs-toggle="modal" data-bs-target="#timeReportingModal">Parar</button>
            `);
        }

        $('#timingText').text(timing.format());

        $(this).css('display', 'none');  
    }.bind(this);

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

    $('#stopTimingBtn').on('click', function() {
        clearInterval(timingCounter);
        timing.update();
        $('#workedTime').text(`${timing.time.hours} horas e ${timing.time.minutes} minutos`);
        $('.cronometer-btns, #timingText').remove();
        $('#startTimingBtn').css('display', 'initial');
    });

    window.timingCounter = setInterval(updateCronometer, 1000)
});

$('#reportTimeBtn').on('click', function() {
    let report;
    if (!localStorage.getItem('report')) {
        report = new Report(true, 0, 0, 0, timing);
    } else {
        report = new Report(false, 0, 0, 0, timing);
    }
    
    report.save();
});

$(document).on('click', '.number-row', function(e) {
    const listData = new ListHandler();
    const targetRow = $(e.target).parents('.number-row');

    $('#numberInfoTel').text(targetRow.find('.number-cell').text());

    const status = targetRow.find('.status-cell').html();
    const statusInfo = ['Inexistente', 'Cx. postal', 'Falha', 'Ocupado', 'Desligado/sem serviço', '-'].some((s) => s === status) ? status : `Sucesso (contato com ${status})`;
    $('#numberInfoStatus').html(statusInfo);

    const lastCall = listData.getPhoneNumber($('#titleCell').text(), $('#numberInfoTel').text()).lastCall;
    const lastCallInfo = lastCall || '-';

    $('#numberInfoLastCall').text(lastCallInfo);

    if (!window.DDDs) {
        fetch('https://gist.githubusercontent.com/ThadeuLuz/797b60972f74f3080b32642eb36481a5/raw/50eff700db88f10f5d619b85f8684145b91e1888/dddsBrasileiros.json')
        .then((response) => response.text())
        .then((data) => {
            window.DDDs = JSON.parse(data);
            const UF = DDDs.estadoPorDdd[$('#numberInfoTel').text().substring(1, 3)] || 'Não identificada';
            $('#numberInfoUF').text(UF);
        });
    } else {
        const UF = DDDs.estadoPorDdd[$('#numberInfoTel').text().substring(1, 3)] || 'Não identificada';
        $('#numberInfoUF').text(UF);
    }
});

$('#editInfoBtn, #saveChangesBtn').on('click', function() {
    const editBtn = $('#editInfoBtn');
    if (editBtn.innerText === 'Editar') {
        editBtn.innerText = 'Cancelar';
    } else {
        editBtn.innerText ='Editar';
    }
    $('#saveChangesBtn, #statusInfoSelector, #numberInfoStatus').toggleClass('d-none');
});


$('#saveChangesBtn').on('click', function() {
    const listsData = new ListHandler();
    const newStatus = $('#statusInfoSelector').val();

    if (newStatus === '-') {   
        listsData.editPhoneNumber($('#titleCell').text(), $('#numberInfoTel').text(), 'lastCall', '-');

    } else if (newStatus === 'Sucesso') {
        $('#contactCreationModal').attr('data-related-number', $(this).parents('.modal').find('#numberInfoTel').text());
        $('#contactCreationModal').modal('show');
        app.displayUserData();
        return;
    }

    listsData.editPhoneNumber($('#titleCell').text(), $('#numberInfoTel').text(), 'status', newStatus);

    app.displayUserData();
});

$('#deleteNumberBtn').on('click', app.deleteNumber.bind(app));