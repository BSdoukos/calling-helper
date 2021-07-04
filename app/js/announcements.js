class Announcement {
    constructor(title, content) {
        this.modal = $('#announcementModal');
        this.title = title;
        this.content = content;
    }

    getAll() {
        return localStorage.getItem('announcements') ? JSON.parse(localStorage.getItem('announcements')) : [];
    }

    fillModal() {
        this.modal.find('.modal-title').text(this.title);
        const content = Array.isArray(this.content) ? this.content.reverse() : [].concat(this.content);
        content.forEach((textBlock) => {
            this.modal.find('.modal-body').prepend(`<p>${textBlock}</p>`);
        });
    }

    getState() {
        const thisAnnouncement = this.getAll().filter((announcement) => announcement.title === this.title)[0];
        return thisAnnouncement?.show;
    }
    
    save(showingState) {
        let announcements = this.getAll();
        announcements = announcements.filter((announcement) => announcement.title !== this.title);

        announcements.push({
            title: this.title,
            show: showingState
        });

        localStorage.setItem('announcements', JSON.stringify(announcements));
    }

    release() {
        const show = this.getState();
        if (typeof show === 'undefined' || show) {
            this.fillModal();
            this.save(true);
            this.modal.modal('show');
        }
        
        this.modal.find('.modal-footer [data-bs-dismiss="modal"]').on('click', () => this.save(false));
    }
}

export default function init() {
    new Announcement('Armazenamento de dados', [
        'Esta aplicação armazena os seus dados de listas telefônicas, contatos, relatórios e outros em seu próprio dispositivo, através do recurso de armazenamento via web.',
        'Por esse motivo, é importante que os dados de website do Calling Helper não sejam excluídos. A limpeza de cookies, histórico de navegação ou cache não resulta em problemas, no entanto, caso os <strong>dados de site</strong> sejam removidos, é possível que ocorra a perda dos seus dados salvos.',
        'Em breve, seus dados passarão a ser armazenados de forma mais segura em um servidor remoto, de forma que esse problema deixará de existir.'
    ]).release();
}