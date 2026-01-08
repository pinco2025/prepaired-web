import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const ChapterDetails: React.FC = () => {
  const { subject, grade, chapter } = useParams<{ subject: string; grade: string; chapter: string }>();
  const [linksMap, setLinksMap] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Define resource tiles with a 'type' that matches your DB `type` column values.
  const resourceTiles = [
    {
      title: 'Study Notes',
      description: 'In-depth chapter summary and key concepts.',
      icon: 'description',
      color: 'accent-1',
      type: 'study_link',
    },
    {
      title: 'Video Lectures',
      description: 'Engaging video lessons from expert faculty.',
      icon: 'play_circle',
      color: 'accent-2',
      type: 'video_link',
    },
    {
      title: 'Practice Questions',
      description: 'Test your knowledge with chapter-wise MCQs.',
      icon: 'quiz',
      color: 'accent-6',
      type: 'practice_link',
    },
    {
      title: 'Flashcards',
      description: 'Quickly memorize key terms and definitions.',
      icon: 'style',
      color: 'accent-4',
      type: 'flashcards_link',
    },
    {
      title: 'Mind Maps',
      description: 'Visualize complex concepts and connections.',
      icon: 'share',
      color: 'accent-3',
      type: 'mindmap_link',
    },
    {
      title: 'Chapter Test',
      description: 'Assess your understanding with a full test.',
      icon: 'assignment_turned_in',
      color: 'accent-5',
      type: 'test_link',
    },
  ];

  useEffect(() => {
    if (!chapter) return;

    const fetchLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build the list of types we want from our tiles
        const types = resourceTiles.map(t => t.type);

        // Request only the 'type' and 'link' columns for the relevant chapter and types
        const { data, error } = await supabase
          .from('global')
          .select('type, link')
          .eq('chapter', chapter)
          .in('type', types);

        if (error) {
          console.error('Error fetching links:', error);
          setError(error.message);
          setLinksMap({});
        } else if (!data) {
          setLinksMap({});
        } else {
          // Convert array -> map: { [type]: link }
          const map: Record<string, string> = {};
          data.forEach(row => {
            if (row.type && row.link) map[row.type] = row.link;
          });
          setLinksMap(map);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching links:', err);
        setError(err?.message || 'Unexpected error');
        setLinksMap({});
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
    // Note: resourceTiles is stable in this example; if it's computed outside the component,
    // include it in deps or memoize it to avoid unnecessary fetches.
  }, [chapter]);

  // Small helper to prettify route params
  const formatName = (name: string | undefined) => {
    if (!name) return '';
    return name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const subjectName = formatName(subject);
  const chapterName = formatName(chapter);
  const fullChapterTitle = `${chapterName}: Some Basic Concepts of Chemistry`;

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex-grow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <nav className="text-sm mb-2 text-text-secondary-light dark:text-text-secondary-dark">
            <ol className="list-none p-0 inline-flex items-center">
              <li className="flex items-center">
                <Link className="hover:text-primary" to={`/subjects/${subject}/${grade}`}>{subjectName}</Link>
              </li>
              <li className="flex items-center">
                <span className="material-icons-outlined mx-2 text-base">chevron_right</span>
                <span className="font-medium text-text-light dark:text-text-dark">{chapterName}</span>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark text-center sm:text-left">
            {fullChapterTitle}
          </h1>
        </div>

        {loading && <div className="mb-4 text-center">Loading resources…</div>}

        <div className="max-w-4xl mx-auto space-y-4">
          {resourceTiles.map((tile, index) => {
            // Use the fetched link for the tile type, fallback to '#'
            const href = linksMap[tile.type] ?? '#';

            return (
              <a
                key={index}
                href={href}
                className="group flex items-center bg-surface-light dark:bg-surface-dark rounded-xl shadow-card-light dark:shadow-card-dark p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                // If you want to disable link when missing:
                aria-disabled={href === '#'}
                onClick={e => { if (href === '#') e.preventDefault(); }}
              >
                <div className="flex-shrink-0 mr-4">
                  <div className={`bg-${tile.color}/10 dark:bg-${tile.color}/20 p-3 rounded-full`}>
                    <span className={`material-icons-outlined text-3xl text-${tile.color}`}>{tile.icon}</span>
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">{tile.title}</h2>
                  <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">{tile.description}</p>
                </div>
                <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark group-hover:text-primary transition-colors ml-4">arrow_forward</span>
              </a>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ChapterDetails;
