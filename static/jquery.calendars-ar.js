/* http://keith-wood.name/calendars.html
   Arabic localisation for Islamic calendar for jQuery.
   Written by Keith Wood (kbwood{at}iinet.com.au) August 2009. */
(function($) {
	$.calendars.calendars.islamic.prototype.regional['ar'] = {
		name: 'Islamic', // The calendar name
		epochs: ['BAM', 'AM'],
		monthNames: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الاول', 'جمادى الآخر',
		'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'],
		monthNamesShort: ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الاول', 'جمادى الآخر',
		'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجة'],
		dayNames: ['يوم الأحد', 'يوم الإثنين', 'يوم الثلاثاء', 'يوم الأربعاء', 'يوم الخميس', 'يوم الجمعة', 'يوم السبت'],
		dayNamesShort: ['يوم الأحد', 'يوم الإثنين', 'يوم الثلاثاء', 'يوم الأربعاء', 'يوم الخميس', 'يوم الجمعة', 'يوم السبت'],
		dayNamesMin: ['يوم الأحد', 'يوم الإثنين', 'يوم الثلاثاء', 'يوم الأربعاء', 'يوم الخميس', 'يوم الجمعة', 'يوم السبت'],
		dateFormat: 'yyyy/mm/dd', // See format options on BaseCalendar.formatDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		isRTL: true // True if right-to-left language, false if left-to-right
	};
})(jQuery);