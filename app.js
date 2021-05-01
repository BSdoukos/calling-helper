const app = new PhoneListController(new PhoneListModel(), new PhoneListView());

$(document).ready(app.displayUserData.bind(app));

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

$('.status-btn').on('click', function() {
    app.changeNumberStatus(this);
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
    app.registerContact();
});