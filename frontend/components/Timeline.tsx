import React from 'react';
import { format, getHours, getMinutes } from 'date-fns';

interface TimelineProps {
  bookings: any[];
}

export default function Timeline({ bookings }: TimelineProps) {
  return (
    <div className="mb-8">
      <div className="text-xs font-bold text-gray-400 uppercase mb-2">Trạng thái sân hôm nay</div>
      <div className="h-8 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative">
        {bookings.map((b, i) => {
          const start = new Date(b.startTime);
          const end = new Date(b.endTime);
          // Tính toán vị trí (6h -> 22h = 960 phút)
          const startMinutes = (getHours(start) * 60 + getMinutes(start)) - (6 * 60);
          const durationMinutes = (end.getTime() - start.getTime()) / 60000;
          const leftPercent = (startMinutes / 960) * 100;
          const widthPercent = (durationMinutes / 960) * 100;
          
          if (leftPercent < 0 || leftPercent > 100) return null;

          return (
            <div 
              key={i}
              className={`absolute h-full border-r border-white/20 flex items-center justify-center text-[8px] text-white font-bold truncate cursor-help ${
                b.status === 'CONFIRMED' ? 'bg-red-500' : 'bg-yellow-400'
              }`}
              style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
              title={`${b.customerName} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`}
            >
              {b.customerName}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
        <span>06:00</span><span>10:00</span><span>14:00</span><span>18:00</span><span>22:00</span>
      </div>
    </div>
  );
}