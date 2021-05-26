$(document).ready(() => {
    let reports = localStorage.getItem('reports');
    if (!reports) {
        localStorage.setItem('reports', JSON.stringify([]));
    }
    reports = JSON.parse(reports);

    function displayReport(month) {
        const report = reports.filter((report) => report.month === month)[0];

        $('#reportTable').find('[data-report-info]').each((i, el) => {
            if ('hours, minutes'.indexOf($(el).data('report-info')) === -1) {
                const content = report ? report[el.getAttribute('data-report-info')] : 0;   
            
                if (typeof content === 'object') {
                    $(el).find('[data-report-info="hours"], [data-report-info="minutes"]').each((i, el) => {
                        el.innerText = report.time[el.getAttribute('data-report-info')];
                    });
                } else {
                    el.innerText = content;
                }
            }
        });
    }
    
    const reportSelector = $('#reportSelector');

    reports.forEach((report) => {
        let formattedReportMonth = report.month.replace('-', '/');
        formattedReportMonth = formattedReportMonth.charAt(0).toUpperCase() + formattedReportMonth.substring(1, formattedReportMonth.length);

        reportSelector.append(`<option value=${report.month}>${formattedReportMonth}</option>`)
    });

    displayReport(reportSelector.val());
});