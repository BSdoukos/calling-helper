$('#listName').on('input', function() {
    if ($(this).val() !== '') {
        $('#submitListBtn').attr('disabled', false)
    } else {
        $('#submitListBtn').attr('disabled', true)
    }
});
$('#phoneNumber, #phoneNumberSequence').on('input', function() {
    if ($('#phoneNumber').val() === '' && $('#phoneNumberSequence').val() === '') {
        $('#submitNumberBtn').attr('disabled', true)
    } else {
        $('#submitNumberBtn').attr('disabled', false)
    }
});

$('#submitListBtn').on('click', (e) => {
    e.preventDefault();
    $('main').html(`
        <div class="container">
            <table class="table phone-table border">
                <thead>
                    <tr>
                        <td class="title-cell" colspan="2">${$('#listName').val()}</td>
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

    $('#newListModal').modal('hide');
});

$('#submitNumberBtn').on('click', function(e) {
    e.preventDefault();
    $('.phone-table').parent('.container').css('max-height', '287.5px').css('overflow', 'auto');
    const table = $('.phone-table tbody');
    table.find('.no-numbers-cell').remove();
    if (!$('#addNumbersBtn').get().length) {
        table.parents('.container').after('<button class="btn btn-primary mt-3" data-bs-toggle="modal" data-bs-target="#addNumbersModal" id="addNumbersBtn">Adicionar números</button>');
    }
    if ($('#phoneNumber').val() !== '') {
        table.prepend(`
            <tr>
                <td class="number-cell">${$('#phoneNumber').val()}</td>
                <td class="status-cell">-</td>
            </tr>
        `);
    }
    if ($('#phoneNumberSequence').val() !== '') {
        let parameterNumbers = $('#phoneNumberSequence').val().split(' - ');
        parameterNumbers = parameterNumbers.map((number) => parseInt(number.replace(/[\(\)\s\-]/g, '')));

        function formatPhoneNumber(number) {
            const ddd = number.match(/^\d{2}/g);
            number = number.replace(ddd, `(${ddd}) `)

            const firstDigits = number.match(/\s\d{5}/g);
            number = number.replace(firstDigits, `${firstDigits}-`)

            return number;
        }
        
        for (parameterNumbers[0]; parameterNumbers[0] <= parameterNumbers[1]; parameterNumbers[0]++) {
            table.append(`
                <tr>
                    <td class="number-cell">${formatPhoneNumber(parameterNumbers[0].toString())}</td>
                    <td class="status-cell">-</td>
                </tr>
            `);
        }
    }
    $('#addNumbersModal').modal('hide');
});