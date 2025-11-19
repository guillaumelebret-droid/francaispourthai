
import React, { useMemo } from 'react';
import { FlashcardData, UserProgress, ReviewStatus, LearningDirection } from '../types';

interface ProgressBarProps {
    cards: FlashcardData[];
    progress: Record<string, UserProgress>;
    direction: LearningDirection;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ cards, progress, direction }) => {
    const stats = useMemo(() => {
        let counts = {
            new: 0,    // Gray (No progress yet)
            again: 0,  // Red
            hard: 0,   // Orange
            good: 0,   // Green
            easy: 0    // Blue
        };

        cards.forEach(card => {
            // We expect the parent to pass a filtered progress object where keys MATCH card.id
            const p = progress[card.id];
            
            if (!p || !p.lastStatus) {
                counts.new++;
            } else {
                switch (p.lastStatus) {
                    case ReviewStatus.AGAIN:
                        counts.again++;
                        break;
                    case ReviewStatus.HARD:
                        counts.hard++;
                        break;
                    case ReviewStatus.GOOD:
                        counts.good++;
                        break;
                    case ReviewStatus.EASY:
                        counts.easy++;
                        break;
                    default:
                        counts.new++;
                }
            }
        });
        return counts;
    }, [cards, progress]);

    // Calcul du total des cartes ayant déjà un statut (déjà jouées)
    const totalReviewed = stats.again + stats.hard + stats.good + stats.easy;

    // Helper pour la largeur
    const getWidth = (count: number) => totalReviewed > 0 ? `${(count / totalReviewed) * 100}%` : '0%';

    const isThaiInterface = direction === 'th_fr';
    const newText = isThaiInterface ? 'ใหม่' : 'Nouveau';
    const totalText = isThaiInterface ? 'ทั้งหมด' : 'Total';
    const fontClass = isThaiInterface ? 'font-thai' : 'font-sans';

    return (
        <div className="w-full flex flex-col bg-white shadow-sm border-b border-slate-200">
            {/* 1. La Barre Visuelle */}
            <div className="w-full h-2 flex bg-slate-100 overflow-hidden">
                 {totalReviewed === 0 ? (
                    <div className="w-full h-full bg-slate-200" />
                 ) : (
                    <>
                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: getWidth(stats.again) }} />
                        <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: getWidth(stats.hard) }} />
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: getWidth(stats.good) }} />
                        <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: getWidth(stats.easy) }} />
                    </>
                 )}
            </div>

            {/* 2. La Légende */}
            <div className="flex items-center justify-between px-4 py-2 text-[10px] font-semibold text-slate-600 bg-slate-50">
                
                {/* Status Counts */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
                        <span>{stats.again}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-orange-400 shadow-sm"></div>
                        <span>{stats.hard}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm"></div>
                        <span>{stats.good}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
                        <span>{stats.easy}</span>
                    </div>
                </div>

                {/* Totals */}
                <div className={`flex items-center gap-2 text-slate-400 ${fontClass}`}>
                    <span title="Cartes non vues">{newText}: {stats.new}</span>
                    <span className="w-px h-3 bg-slate-300"></span>
                    <span title="Total des cartes">{totalText}: {cards.length}</span>
                </div>
            </div>
        </div>
    );
};
