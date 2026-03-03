import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface RenderMathProps {
    text: string;
    className?: string;
}

/**
 * Unified LaTeX/math text renderer.
 * Supports both inline ($...$) and block ($$...$$) math expressions.
 * Consolidates logic from CondensedPractice, Super30, and TestInterface.
 */
const RenderMath: React.FC<RenderMathProps> = ({ text, className }) => {
    if (!text) return null;

    // Split by both $$ (display/block) and $ (inline) delimiters
    // Regex captures the delimiters to identify math sections
    const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[\s\S]+?\$)/g);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.startsWith('$$') && part.endsWith('$$')) {
                    // Block/display math
                    return (
                        <div key={index} className="overflow-x-auto custom-scrollbar my-2">
                            <BlockMath math={part.slice(2, -2)} />
                        </div>
                    );
                } else if (part.startsWith('$') && part.endsWith('$')) {
                    // Inline math
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                // Plain text - render as-is
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default RenderMath;
