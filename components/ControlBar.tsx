
import React from 'react';
import { ReviewStatus, LearningDirection } from '../types';

interface ControlBarProps {
    isVisible: boolean;
    onRate: (status: ReviewStatus) => void;
    direction: LearningDirection;
}

export const ControlBar: React.FC<ControlBarProps> = ({ isVisible, onRate, direction }) => {
    if (!isVisible) return null;

    const isThaiInterface = direction === 'th_fr';

    const texts = {
        again: isThaiInterface ? 'จำไม่ได้' : 'Je ne sais pas',
        hard: isThaiInterface ? 'ยาก' : 'J\'avais oublié',
        good: isThaiInterface ? 'จำได้' : 'Je me rappelle',
        easy: isThaiInterface ? 'ง่าย' : 'C\'est acquis'
    };

    const textClass = isThaiInterface ? 'font-thai text-base' : 'font-sans text-[10px]';

    return (
        <div className="w-full max-w-sm grid grid-cols-4 gap-2 animate-[fadeIn_0.3s_ease-out]">
            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.AGAIN); }}
                className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl active:scale-95 transition-transform border border-red-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
                <span className={`${textClass} font-bold text-red-800 leading-tight text-center`}>{texts.again}</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.HARD); }}
                className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-xl active:scale-95 transition-transform border border-orange-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-orange-500 mb-1"></div>
                <span className={`${textClass} font-bold text-orange-800 leading-tight text-center`}>{texts.hard}</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.GOOD); }}
                className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-xl active:scale-95 transition-transform border border-green-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-green-600 mb-1"></div>
                <span className={`${textClass} font-bold text-green-800 leading-tight text-center`}>{texts.good}</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.EASY); }}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl active:scale-95 transition-transform border border-blue-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-blue-600 mb-1"></div>
                <span className={`${textClass} font-bold text-blue-800 leading-tight text-center`}>{texts.easy}</span>
            </button>
        </div>
    );
};
