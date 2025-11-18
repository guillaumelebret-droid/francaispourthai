import React from 'react';
import { ReviewStatus } from '../types';

interface ControlBarProps {
    isVisible: boolean;
    onRate: (status: ReviewStatus) => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ isVisible, onRate }) => {
    if (!isVisible) return null;

    return (
        <div className="w-full max-w-sm grid grid-cols-4 gap-2 animate-[fadeIn_0.3s_ease-out]">
            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.AGAIN); }}
                className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl active:scale-95 transition-transform border border-red-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
                <span className="text-[10px] font-bold text-red-800 leading-tight text-center">Je ne sais pas</span>
                <span className="text-[8px] text-red-400">Again</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.HARD); }}
                className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-xl active:scale-95 transition-transform border border-orange-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-orange-500 mb-1"></div>
                <span className="text-[10px] font-bold text-orange-800 leading-tight text-center">J'avais oublié</span>
                <span className="text-[8px] text-orange-400">Hard</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.GOOD); }}
                className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-xl active:scale-95 transition-transform border border-green-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-green-600 mb-1"></div>
                <span className="text-[10px] font-bold text-green-800 leading-tight text-center">Je me rappelle</span>
                <span className="text-[8px] text-green-500">Good</span>
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); onRate(ReviewStatus.EASY); }}
                className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl active:scale-95 transition-transform border border-blue-100 shadow-sm"
            >
                <div className="w-3 h-3 rounded-full bg-blue-600 mb-1"></div>
                <span className="text-[10px] font-bold text-blue-800 leading-tight text-center">C'est acquis</span>
                <span className="text-[8px] text-blue-500">Easy</span>
            </button>
        </div>
    );
};