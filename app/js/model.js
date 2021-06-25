class PhoneListModel {
    constructor() {}

    registerPhoneList() {
        if (!localStorage.getItem('phoneLists')) localStorage.setItem('phoneLists', JSON.stringify([]));

        let phoneLists = JSON.parse(localStorage.getItem('phoneLists'));

        const currentList = phoneLists.filter((list) => list && list.name === $('#titleCell').text());

        let lastCalls 
        if (currentList.length) {
            lastCalls = currentList[0].numbers.map((number) => number.lastCall);
        }

        phoneLists = phoneLists.filter((list) => list && list.name !== $('#titleCell').text());


        const listNumbers = [];
        if ($('.phone-table .number-cell').get().length) {
            Array.from($('.phone-table .number-cell')).forEach((cell, i) => {
                listNumbers.push({
                    number: $(cell).text(),
                    status: $(cell).parent().data('related-contact') || $(cell).next('.status-cell').text(),
                    lastCall: lastCalls[i]
                });
            });
        }

        const isCompleted = listNumbers.every((number) => number.status !== '-');

        const currentNumber = $('.phone-table tr.current .number-cell').text();

        const listIndex = phoneLists.push({name: $('#titleCell').text(), numbers: listNumbers, isCompleted, currentNumber}) - 1;

        localStorage.setItem('phoneLists', JSON.stringify(phoneLists));
        localStorage.setItem('activeList', JSON.stringify(listIndex));

        return listIndex;
    }

    getNumbersSequence(parameterNumbers) {
        parameterNumbers = parameterNumbers.map((number) => parseInt(number.replace(/[\(\)\s\-]/g, '')));

        function formatPhoneNumber(number) {
            const ddd = number.match(/^\d{2}/g);
            number = number.replace(ddd, `(${ddd}) `)

            const firstDigits = number.match(/\s\d{5}/g);
            number = number.replace(firstDigits, `${firstDigits}-`)

            return number;
        }
        
        const sequence = [];
        for (parameterNumbers[0]; parameterNumbers[0] <= parameterNumbers[1]; parameterNumbers[0]++) {
            sequence.push(formatPhoneNumber(parameterNumbers[0].toString()));
        }

        return sequence;
    }

    getUserData() {
        if (localStorage.getItem('phoneLists')) {         

            const phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
            const activeList = phoneLists[JSON.parse(localStorage.getItem('activeList'))];

            return {phoneLists, activeList};
        }
    }

    deleteList(listName) {
        const userData = this.getUserData();

        let activeList;
        userData.phoneLists.forEach((list) => {
            if (list.name === listName) {
                if (list === userData.activeList) {
                    activeList = 0;
                }
            }
        });
        
        userData.phoneLists = userData.phoneLists.filter((list) => list.name !== listName);
        
        activeList = activeList === undefined ?  userData.phoneLists.indexOf(userData.activeList) : activeList;
        activeList = userData.phoneLists.length ? activeList : 'deleted';

        localStorage.setItem('phoneLists', JSON.stringify(userData.phoneLists));
        localStorage.setItem('activeList', JSON.stringify(activeList));
    }

    createContact(number = $('#currentNumber').text()) {
        const lastCall = JSON.parse(localStorage.getItem('phoneLists'))[JSON.parse(localStorage.getItem('activeList'))].numbers.filter((tel) => tel.number === $('#currentNumber').text())[0].lastCall;
        const contact = new Contact($('#contactName').val(), number, lastCall, $('#contactRemarks').val(), [
            {
                topic: $('#firstTalkTopic').val(),
                text: $('#firstTalkText').val()
            }
        ]);       
        contact.save();

        return contact;
    }
}