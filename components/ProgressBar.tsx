
import React, { useMemo } from 'react';
import { FlashcardData, UserProgress, ReviewStatus } from '../types';

interface ProgressBarProps {
    cards: FlashcardData[];
    progress: Record<string, UserProgress>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ cards, progress }) => {
    const stats = useMemo(() => {
        let counts = {
            new: 0,    // Gray (No progress yet)
            again: 0,  // Red
            hard: 0,   // Orange
            good: 0,   // Green
            easy: 0    // Blue
        };

        cards.forEach(card => {
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

    // Si aucune carte n'a été jouée, on affiche une barre grise pleine (Nouveau)
    if (totalReviewed === 0) {
         return (
            <div className="w-full h-4 bg-slate-200 shadow-inner overflow-hidden">
                 <div className="h-full bg-slate-300 w-full transition-all duration-500" title={`Nouveau: ${stats.new}`} />
            </div>
         );
    }

    // Fonction pour calculer la largeur en pourcentage par rapport aux cartes JOUÉES seulement
    const getWidth = (count: number) => ({ width: `${(count / totalReviewed) * 100}%` });

    return (
        <div className="w-full h-4 flex bg-slate-200 shadow-inner overflow-hidden">
            {/* Je ne sais pas (Red) */}
            <div 
                className="h-full bg-red-500 transition-all duration-500" 
                style={getWidth(stats.again)} 
                title={`À revoir: ${stats.again}`}
            />
            {/* J'avais oublié (Orange) */}
            <div 
                className="h-full bg-orange-400 transition-all duration-500" 
                style={getWidth(stats.hard)} 
                title={`Difficile: ${stats.hard}`}
            />
            {/* Je me rappelle (Green) */}
            <div 
                className="h-full bg-green-500 transition-all duration-500" 
                style={getWidth(stats.good)} 
                title={`Connu: ${stats.good}`}
            />
            {/* C'est acquis (Blue) */}
            <div 
                className="h-full bg-blue-600 transition-all duration-500" 
                style={getWidth(stats.easy)} 
                title={`Acquis: ${stats.easy}`}
            />
        </div>
    );
};
