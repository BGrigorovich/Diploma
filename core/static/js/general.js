var ukrDate = {
    monthNames: ['Січня','Лютого','Березня','Квітня','Травня','Червня', 'Липня','Серпня','Вересня','Жовтня','Листопада','Грудня'], // set month names
    monthNamesShort: ['Січ','Лют','Бер','Кві','Тра','Чер','Лип','Сер','Вер','Жовт','Лист','Гру'],
    dayNames: ['Неділя','Понеділок','Вівторок','Середа','Четвер',"П'ятниця",'Субота'],
    dayNamesShort: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
    dayNamesMin: ['Нд','Пн','Вт','Ср','Чт','Пт','Сб'],
    dateFormat: 'dd/mm/yy'
};

$.datepicker.regional['ua'] = ukrDate;
$.datepicker.setDefaults($.datepicker.regional['ua']);

function yesterday() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}
