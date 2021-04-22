class PhoneListView {
    constructor() {
    }

    validateInput(type) {
        switch (type) {
            case 'listName':
                if ($('#listName').val() !== '') {
                    $('#submitListBtn').attr('disabled', false)
                } else {
                    $('#submitListBtn').attr('disabled', true)
                }
                break;
            
            case 'phoneNumbers':
                if ($('#phoneNumber').val() === '' && $('#phoneNumberSequence').val() === '') {
                    $('#submitNumberBtn').attr('disabled', true)
                } else if ($('#phoneNumber').val().match(/\(\d{2}\)\s\d{5}\-\d{4}/g) || $('#phoneNumberSequence').val().match(/\(\d{2}\)\s\d{5}\-\d{4}\s\-\s\(\d{2}\)\s\d{5}\-\d{4}/g)) {
                    $('#submitNumberBtn').attr('disabled', false)
                }
                break;

            default:
                break;
        }
    }   

    displayPhoneList(name, dataIndex) {
        $('#listContainer').html(`
            <div class="container">
                <table class="table phone-table border" data-index="${dataIndex}">
                    <thead>
                        <tr>
                            <td class="title-cell" colspan="2">${name}</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="no-numbers-cell px-3">
                                <p class="mt-2">Esta lista ainda não possui nenhum número de telefone.</p>
                                <button class="btn btn-primary mt-1 mb-2" data-bs-toggle="modal" data-bs-target="#addNumbersModal">Adicionar números</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `);
    }

    adaptPhoneList() {
        const tableBody = $('.phone-table tbody');
        tableBody.parents('#listContainer').css('max-height', '287.5px').css('overflow', 'auto');
        tableBody.find('.no-numbers-cell').remove();
        if (!$('#addNumbersBtn').get().length) {
            tableBody.parents('#listContainer').after('<button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#addNumbersModal" id="addNumbersBtn">Adicionar números</button>');
        }
    }

    appendNumber(number, status) {
        $('.phone-table tbody').append(`
            <tr>
                <td class="number-cell">${number}</td>
                <td class="status-cell">${status}</td>
            </tr>
        `);
    }

    updateWorkContainer() {
        $('#workContainer').removeClass('hidden');
        $('#currentNumber').text($('.phone-table tr.current .number-cell').text());
        $('#callBtn').attr('href', `tel:55${$('.phone-table tr.current .number-cell').text().replace(/[\(\)\s\-]/g, '')}`);
    }
}