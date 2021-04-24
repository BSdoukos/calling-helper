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
        userData.phoneLists.forEach((list) => this.view.displayListCard(list.name, list.numbers.length, calcListCompletionPercentage(list)));
        
        $('.list-selection-checkbox').on('change', () => {
            app.view.validateInput('listSelection');
        }); 
    }

    displayUserData() {
        const userData = this.model.getUserData();
        if (userData) {         
            this.view.displayPhoneList(userData.activeList.name, JSON.parse(localStorage.getItem('userData.activeList')));
            if (userData.activeList.numbers.length) {
                this.view.adaptPhoneList();
                userData.activeList.numbers.forEach((number) => this.view.appendNumber(number.number, number.status));
                $(`.phone-table .number-cell:contains("${userData.activeList.currentNumber}")`).parent().addClass('current bg-primary text-light');
                app.view.updateWorkContainer();
                this.displayLists();
            }
        }
    }

    createPhoneList() {
        this.view.displayPhoneList($('#listName').val());
        $('.phone-table').data('index', this.model.registerPhoneList());
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
        $('.phone-table .status-cell:contains("-"):first').parent().addClass('current bg-primary text-light');
        app.view.updateWorkContainer();
        this.displayLists();
    }

    changeNumberStatus(statusButton) {
        this.view.displayNewNumberStatus($(statusButton).text());
        this.view.changeCurrentItem();
        this.model.registerPhoneList();
        this.view.updateWorkContainer();
        this.displayLists();
    }
}