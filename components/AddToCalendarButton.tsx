'use client'

import { CalendarPlus } from 'lucide-react'
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
    <>
      <button
        onClick={handleAddToCalendar}
        className="absolute bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 lg:gap-2 text-primary hover:text-primary/80 transition-all duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer"
        aria-label="Guardar Fecha"
        title="Guardar Fecha"
      >
        <CalendarPlus className="w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 animate-[soft-bounce_2s_infinite]" />
        <span className="text-[10px] lg:text-xs xl:text-sm font-bold tracking-widest uppercase">Guardar Fecha</span>
      </button>

      <style jsx>{`
        @keyframes soft-bounce {
          0%, 100% {
            transform: translateY(-15%);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0,0,0.2,1);
          }
        }
      `}</style>
    </>
  );
}
