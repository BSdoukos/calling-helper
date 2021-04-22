const app = new PhoneListController(new PhoneListModel(), new PhoneListView());

$(document).ready(app.displayUserData.bind(app));

$('#listName').on('input', function() {
    app.view.validateInput('listName');
});
$('#phoneNumber, #phoneNumberSequence').on('input', function() {
    app.view.validateInput('phoneNumbers');
});

$('#submitListBtn').on('click', (e) => {
    e.preventDefault();
    app.createPhoneList();
    $('#newListModal').modal('hide');
});

$('#submitNumberBtn').on('click', function(e) {
    e.preventDefault();
    app.fillPhoneList();
    $('#addNumbersModal').modal('hide');
});