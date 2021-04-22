class PhoneListController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    displayUserData() {
        const activeList = this.model.getUserData();
        if (activeList) {         
            this.view.displayPhoneList(activeList.name, JSON.parse(localStorage.getItem('activeList')));
            this.view.adaptPhoneList();
            activeList.numbers.forEach((number) => this.view.appendNumber(number.number, number.status));
            $('.phone-table .status-cell:contains("-"):first').parent().addClass('current bg-primary text-light');
            app.view.updateWorkContainer();
        }
    }

    createPhoneList() {
        this.view.displayPhoneList($('#listName').val(), this.model.registerPhoneList($('#listName').val()));
    }

    fillPhoneList() {
        this.view.adaptPhoneList();
        if ($('#phoneNumber').val() !== '') {    
            this.model.registerNumber($('#phoneNumber').val(), '-');
            this.view.appendNumber($('#phoneNumber').val(), '-');
        }
        if ($('#phoneNumberSequence').val() !== '') {
            const sequence = this.model.getNumbersSequence($('#phoneNumberSequence').val().split(' - '));
            
            sequence.forEach((number) => {
                this.model.registerNumber(number, '-');
                this.view.appendNumber(number, '-');
            });
        }
        $('.phone-table .status-cell:contains("-"):first').parent().addClass('current bg-primary text-light');
        app.view.updateWorkContainer();
    }
}