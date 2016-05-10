/**
 * Return a date using the format the API uses
 * @param {number} [year=2000]
 * @param {number} [month=1] 1-12 for Jan-Dec
 * @param {number} [day=1] Day of the year
 * @param {number} [hours=0]
 * @param {number} [minutes=0]
 * @param {number} [seconds=0]
 * @param {number} [milliseconds=0]
 * @returns {string}
 */
var getDateString = function (year, month, day, hours, minutes, seconds, milliseconds) {
    year         = year         || 2000;
    month        = month        || 1;
    day          = day          || 1;
    hours        = hours        || 0;
    minutes      = minutes      || 0;
    seconds      = seconds      || 0;
    milliseconds = milliseconds || 0;
    var date = new Date(year, month-1, day, hours, minutes, seconds, milliseconds);
    return date.toISOString();
};

module.exports = {
    getDateString: getDateString
};