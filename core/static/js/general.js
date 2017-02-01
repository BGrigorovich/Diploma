// переклад інтерфейсу дейтпікера українською
var ukrDate = {
    monthNames: ['Січня','Лютого','Березня','Квітня','Травня','Червня', 'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'], // set month names
    monthNamesShort: ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жовт','Лист','Гру'],
    dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четвер',"П'ятниця",'Субота'],
    dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
    dayNamesMin: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
    dateFormat: 'dd/mm/yy'
};

// настройка дейтпікерів на українську
$.datepicker.regional['ua'] = ukrDate;
$.datepicker.setDefaults($.datepicker.regional['ua']);

/**
 * повертає дату вчорашнього дня
 * @returns {Date} - вчорашній день
 */
function yesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

/**
 * приводить дату з дейтпікера до формату API
 * @param date - дата
 * @returns {string} - дата в форматі API
 */
function dateToAPIFormat(date) {
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

var startDate = new Date('2016-11-23');