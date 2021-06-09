const app = new PhoneListController(new PhoneListModel(), new PhoneListView());

$(document).ready(() => {

// Verifica a disponibilidade do Web Storage
    function storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }

    if (!storageAvailable('localStorage') || !storageAvailable('sessionStorage')) {
        $('#noStorageModal').modal('show');
    }

app.displayUserData();

// Verifica se o cronômetro está ativo
    if (Timing.getSaved()) {
        app.initCronometer(true);
    }

// Verifica se o modal "Contatar desenvolvedor" deve ser aberto
    const params = new URLSearchParams(location.search);

    if (params.has('window')) {
        $(`#${params.get('window')}`).modal('show');
        history.replaceState({}, document.title, "index.html");
    }

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
        new Scheduling(Contact.get(contactID), $('#nextTalkTopic').val(), $('#nextTalkDate').val(), $('#nextTalkTime').val()).save();
    }
});

$('#startTimingBtn').on('click', function() {
    app.initCronometer();
});

$('#reportTimeBtn').on('click', function() {
    new Report(false, 0, 0, 0, timing.time).save();
    Timing.clearSaved();
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

    if (editBtn.text() === 'Editar') {
        editBtn.text('Cancelar');
    } else {
        editBtn.text('Editar');
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
});