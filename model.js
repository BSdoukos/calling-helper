class PhoneListModel {
    constructor() {
    }

    registerPhoneList() {
        if (!localStorage.getItem('phoneLists')) localStorage.setItem('phoneLists', JSON.stringify([]));

        let phoneLists = JSON.parse(localStorage.getItem('phoneLists'));
        phoneLists = phoneLists.filter((list) => list.name !== $('#titleCell').text());

        const listNumbers = [];
        if ($('.phone-table .number-cell').get().length) {
            Array.from($('.phone-table .number-cell')).forEach((cell) => listNumbers.push({number: $(cell).text(), status: $(cell).next('.status-cell').text()}));
        }
        const currentNumber = $('.phone-table tr.current .number-cell').text();

        const listIndex = phoneLists.push({name: $('#titleCell').text(), numbers: listNumbers, currentNumber}) - 1;

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
}