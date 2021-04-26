const app = new PhoneListController(new PhoneListModel(), new PhoneListView());

$(document).ready(app.displayUserData.bind(app));

$('#listName').on('input', function() {
    app.view.validateInput('listName');
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