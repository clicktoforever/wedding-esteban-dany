'use client'

export default function AddToCalendarButton() {
  const handleAddToCalendar = () => {
    // Crear evento de calendario en formato .ics
    const event = {
      title: 'Boda de Carlos & Dany',
      description: 'Ceremonia civil y festejo\\n\\nUbicación: https://share.google/rG5IgDFHQyzZgs1Q4',
      location: 'Hacienda Capelo, Quito, Ecuador',
      start: '20260411T110000',
      end: '20260411T230000',
      url: 'https://share.google/rG5IgDFHQyzZgs1Q4'
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Boda Carlos & Dany//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTART:${event.start}`,
      `DTEND:${event.end}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location}`,
      `URL:${event.url}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'boda-Carlos-dany.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  };

  return (
    <button
      onClick={handleAddToCalendar}
      className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-primary hover:text-primary/80 transition-all duration-300 hover:scale-110 active:scale-95"
      aria-label="Agregar al calendario"
      title="Agregar al calendario"
    >
      <svg className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}
