$(document).ready(() => {
    let reports = localStorage.getItem('reports');
    if (!reports) {
        new Report(true, 0, 0, 0, {hours: 0, minutes: 0}).save();
    }
    reports = JSON.parse(localStorage.getItem('reports'));

    if (Report.currentMonth !== reports[reports.length - 1].month) {
        new Report(true, 0, 0, 0, {hours: 0, minutes: 0}).save();
    }

    function displayReport(month) {  
        const report = JSON.parse(localStorage.getItem('reports')).filter((report) => report.month === month)[0];

        $('#reportTable').find('[data-report-info]').each((i, el) => {
            const content = report ? report[el.getAttribute('data-report-info')] : 0;   
            el.innerText = content;
        });
    }
    
    const reportSelector = $('#reportSelector');

    reports.forEach((report) => {
        let formattedReportMonth = report.month.replace('-', '/');
        formattedReportMonth = formattedReportMonth.charAt(0).toUpperCase() + formattedReportMonth.substring(1, formattedReportMonth.length);

        reportSelector.prepend(`<option value=${report.month}>${formattedReportMonth}</option>`)
        reportSelector.find('option:first').prop('selected', true);
    });

    displayReport(reportSelector.val());
    
    $('#editReportBtn').on('click', function() {
        const parentModal = $($(this).data('bs-target'));
        parentModal.find('input[data-report-info]').each((i, el) => {
            el.value = $('#reportTable').find('[data-report-info]')[i].innerText;
        });
        parentModal.find('[data-report-info="month"]').text($('#reportSelector').val().replace('-', '/').replace(/^\w/g, $('#reportSelector').val().charAt(0).toUpperCase()));
    });
    
    $('#saveReportChangesBtn').on('click', function(e) {
        e.preventDefault();
    
        const parentModal = $(this).closest('.modal');
    
        const notTimeReportItems = parentModal.find('input[data-report-info]').get().map((input) => {
            if (['hours', 'minutes'].every((label) => label !== $(input).data('report-info'))) {
                return input.value;
            }
        });
        notTimeReportItems.splice(0, 2)
    
        Report.redefine();
        new Report(false, ...notTimeReportItems, {hours: parentModal.find('input[data-report-info="hours"]').val(), minutes: parentModal.find('input[data-report-info="minutes"]').val()}).save();
        displayReport(reportSelector.val());
    }); 

    $('#toggleReportViewBtn').on('click', function() {
        this.innerText = this.innerText === 'Ocultar' ? 'Exibir' : 'Ocultar';
        const reportTable = $('#reportTable');

        if (reportTable.hasClass('hiding')) {
            displayReport(reportSelector.val());
        } else {
            reportTable.find('[data-report-info]').text('-');
        }

        reportTable.toggleClass('hiding')
    });

    reportSelector.on('change', () => displayReport(reportSelector.val()));
});
