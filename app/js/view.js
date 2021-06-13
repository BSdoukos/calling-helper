class PhoneListView {
    constructor() {
    }

    validateInput(type, formSelector) {
        switch (type) {
            case 'simple':
                const requiredInputs = $(formSelector).find('input').get().filter((input) => input.hasAttribute('required'));

                if (requiredInputs.every((input) => input.value !== '')) {
                    $(formSelector).find('[type="submit"]').attr('disabled', false)
                } else {
                    $(formSelector).find('[type="submit"]').attr('disabled', true)
                }
                break;
            
            case 'phoneNumbers':
                if ($('#phoneNumber').val() === '' && $('#phoneNumberSequence').val() === '') {
                    $('#submitNumberBtn').attr('disabled', true)
                } else if ($('#phoneNumber').val().match(/\(\d{2}\)\s\d{5}\-\d{4}/g) || $('#phoneNumberSequence').val().match(/\(\d{2}\)\s\d{5}\-\d{4}\s\-\s\(\d{2}\)\s\d{5}\-\d{4}/g)) {
                    $('#submitNumberBtn').attr('disabled', false)
                }
                break;

            case 'listSelection':
                const checkedBoxes = $('.list-selection-checkbox').get().filter((checkbox) => checkbox.checked);
                if (checkedBoxes.length) {
                    $('#deleteListBtn').attr('disabled', false);
                    if (checkedBoxes.length < 2) {
                        $('#openListBtn').attr('disabled', false);
                    } else {
                        $('#openListBtn').attr('disabled', true);
                    }
                } else {
                    $('.list-managing-btn').attr('disabled', true)
                }
                break;
            
            default:
                break;
        }
    }   

    displayPhoneList(name) {
        $('#noListsInfo, #workContainer, #listContainer .spinner-border').addClass('hidden');
        if ($('.phone-table, .list-related-btn').get().length) {
            $('.phone-table, .list-related-btn').remove();
        }
        $('#listContainer').get(0).innerHTML += `
            <div class="container p-lg-0">
                <table class="table phone-table table-bordered">
                    <thead>
                        <tr>
                            <td id="titleCell" colspan="2">${name}</td>
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
        `;
    }

    adaptPhoneList() {
        const tableBody = $('.phone-table tbody');
        tableBody.parents('#listContainer').css('max-height', '287.5px').css('overflow', 'auto');
        tableBody.find('.no-numbers-cell').remove();
        if (!$('#addNumbersBtn').get().length) {
            tableBody.parents('#listContainer').after(`
                <div class="mt-2 d-lg-flex justify-content-center align-items-center">
                    <button class="btn btn-primary mt-3 mx-lg-2 list-related-btn" data-bs-toggle="modal" data-bs-target="#addNumbersModal" id="addNumbersBtn">Adicionar números</button>
                    <br>
                    <button class="btn text-primary mt-2 mx-lg-2 mt-lg-3 list-related-btn" data-bs-toggle="modal" data-bs-target="#listsManagingModal" id="manageListsBtn">Gerenciar listas</button>
                </div>
            `);
        }
    }

    appendNumber(number, status, setAsCurrent = true, relatedContact) {
        const table = $('.phone-table tbody');
        const newRow = $(`
            <tr class="number-row" data-bs-toggle="modal" data-bs-target="#numberInfoModal">
                <td class="number-cell text-truncate">${number}</td>
                <td class="status-cell text-truncate">${status}</td>
            </tr>
        `).appendTo(table);

        if (!table.find('tr.current').length && setAsCurrent) {
            newRow.addClass('current table-active');
        }

        if (relatedContact) {
            newRow.attr('data-related-contact', relatedContact);
        }

        table.parent('table').addClass('table-hover');
    }

    updateWorkContainer() {
        $('#workContainer').removeClass('hidden');
        $('#currentNumber').text($('.phone-table tr.current .number-cell').text());
        $('#callBtn').attr('href', `tel:${$('.phone-table tr.current .number-cell').text().replace(/\(\d{2}\)\s/g, '').replace('-', '')}`);
    }

    displayNewNumberStatus(status, number = $('#currentNumber').text()) {
        $(`.phone-table .number-cell:contains("${number}") + .status-cell`).html(status);

        if ($('.phone-table .status-cell').get().every((cell) => $(cell).text() !== '-')) {
            $('#addNumbersBtn').attr('disabled', true);
        }
    }

    changeCurrentItem() {
        const currentItem = $('.phone-table tr.current');
        currentItem.removeClass('current table-active');

        if (currentItem.next('tr').length) {
            currentItem.next('tr').addClass('current table-active');
        } else {
            $('.phone-table tr:nth-of-type(2)').addClass('current table-active');
        }
    }

    displayListCard(listName, listNumberQuantity, listCompletionPercentage) {
        const sameListCard = $(`#phoneListsDisplay .list-group-item:contains("${listName}")`).get(0);
        if (sameListCard) {
            sameListCard.remove();
        }
        $('#phoneListsDisplay').append(`
            <li class="list-group-item d-flex justify-content-between list-management-item">
                <div class="list-info">
                    <div class="fw-bold list-title">${listName}</div>
                    <p class="mb-0">${listNumberQuantity} números, ${listCompletionPercentage}% completa</p>
                </div>
                <input type="checkbox" class="list-selection-checkbox">
            </li>
        `);
    }

    clear() {
        $('.phone-table').parent('.container').remove();
        $('.list-related-btn').remove();
        $('#listContainer').removeAttr('style');
        $('#workContainer').addClass('hidden');
        $('#noListsInfo').removeClass('hidden');
    }
}