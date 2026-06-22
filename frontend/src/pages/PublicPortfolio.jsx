import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Mail, Phone, ExternalLink, Award, FileText, ArrowRight } from 'lucide-react';

const GithubIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const PublicPortfolio = () => {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [theme, setTheme] = useState('modern');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/public/portfolios/${userId}`);
        if (res.data) {
          setTheme(res.data.theme);
          setData(JSON.parse(res.data.portfolioData));
        }
      } catch (err) {
        console.error(err);
        setError('Portfolio not found or not published yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicPortfolio();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center dark:bg-slate-950">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">404 - Portfolio Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">This user hasn't set up or published their portfolio website yet.</p>
      </div>
    );
  }

  // Theme layout styling helpers
  const getPageBg = () => {
    if (theme === 'dark') return 'bg-slate-950 text-slate-150';
    if (theme === 'creative') return 'bg-gradient-to-tr from-violet-500/10 via-pink-500/10 to-indigo-500/10 bg-slate-50 text-slate-800';
    if (theme === 'sleek') return 'bg-slate-900 text-slate-100 font-mono';
    return 'bg-slate-50/50 text-slate-800';
  };

  const getCardBg = () => {
    if (theme === 'dark') return 'bg-slate-900 border border-slate-800';
    if (theme === 'creative') return 'bg-white/80 backdrop-blur-md border border-white/40 shadow-md';
    if (theme === 'sleek') return 'bg-slate-950 border border-slate-800';
    return 'bg-white border border-slate-100 shadow-sm';
  };

  const getHeaderColor = () => {
    if (theme === 'dark') return 'text-indigo-400';
    if (theme === 'creative') return 'text-purple-700';
    if (theme === 'sleek') return 'text-indigo-400';
    return 'text-indigo-650';
  };

  return (
    <div className={`min-h-screen pb-16 ${getPageBg()}`}>
      {/* Hero Section */}
      <header className={`py-20 text-center ${
        theme === 'modern' ? 'bg-gradient-to-tr from-indigo-700 to-violet-650 text-white' :
        theme === 'dark' ? 'bg-slate-900/40 border-b border-slate-900' :
        theme === 'creative' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white' :
        'border-b border-slate-800'
      }`}>
        <div className="mx-auto max-w-3xl px-6 space-y-4">
          {theme === 'creative' && <div className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">Creative Dev</div>}
          <h1 className="text-4xl font-extrabold md:text-5xl tracking-tight">{data.hero?.title}</h1>
          <p className={`text-base md:text-lg font-semibold uppercase tracking-wider ${theme === 'dark' || theme === 'sleek' ? 'text-indigo-400' : 'text-indigo-100/90'}`}>
            {data.hero?.subtitle}
          </p>
          <p className="text-sm md:text-base leading-relaxed max-w-xl mx-auto opacity-90">{data.hero?.bio}</p>
        </div>
      </header>

      {/* Main body */}
      <main className="mx-auto max-w-4xl px-6 mt-12 space-y-12">
        {/* About Me */}
        <section className={`rounded-2xl p-8 ${getCardBg()}`}>
          <h2 className={`text-xl font-bold mb-4 ${getHeaderColor()}`}>About Me</h2>
          <p className="text-sm leading-relaxed text-slate-650 dark:text-slate-350">{data.about?.description}</p>
        </section>

        {/* Skills */}
        {data.skills?.length > 0 && (
          <section className={`rounded-2xl p-8 ${getCardBg()}`}>
            <h2 className={`text-xl font-bold mb-4 ${getHeaderColor()}`}>Core Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s, idx) => (
                <span
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    theme === 'dark' || theme === 'sleek' ? 'bg-slate-950 border border-slate-800 text-slate-300' :
                    theme === 'creative' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-800'
                  }`}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <section className="space-y-6">
            <h2 className={`text-xl font-bold border-b pb-2 dark:border-slate-800 ${getHeaderColor()}`}>Featured Projects</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {data.projects.map((p, idx) => (
                <div key={idx} className={`rounded-2xl p-6 flex flex-col justify-between ${getCardBg()}`}>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight">{p.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.technologies}</p>
                    <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mt-3">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Work Experience */}
        {data.experience?.length > 0 && (
          <section className="space-y-4">
            <h2 className={`text-xl font-bold border-b pb-2 dark:border-slate-800 ${getHeaderColor()}`}>Experience</h2>
            <div className="space-y-4">
              {data.experience.map((e, idx) => (
                <div key={idx} className={`rounded-2xl p-6 ${getCardBg()}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 font-bold">
                    <span className="text-sm">{e.company} — {e.role}</span>
                    <span className="text-xs text-slate-500 font-semibold">{e.duration}</span>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed mt-3 whitespace-pre-line">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <section className={`rounded-2xl p-8 ${getCardBg()}`}>
            <h2 className={`text-xl font-bold mb-4 ${getHeaderColor()}`}>Certifications</h2>
            <ul className="space-y-2">
              {data.certifications.map((c, idx) => (
                <li key={idx} className="flex items-center text-xs leading-relaxed text-slate-650 dark:text-slate-350">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mr-2"></span>
                  <span className="font-bold">{c.name}</span> — {c.issuer}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contact Info */}
        <section className={`rounded-2xl p-8 text-center ${getCardBg()}`}>
          <h2 className={`text-xl font-bold mb-2 ${getHeaderColor()}`}>Get In Touch</h2>
          <p className="text-xs text-slate-500 dark:text-slate-405 mb-6">Interested in working together? Reach out via channels below.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {data.contact?.email && (
              <a href={`mailto:${data.contact.email}`} className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                <Mail className="h-4 w-4" /> {data.contact.email}
              </a>
            )}
            {data.contact?.github && (
              <a href={data.contact.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                <GithubIcon className="h-4 w-4" /> GitHub
              </a>
            )}
            {data.contact?.linkedin && (
              <a href={data.contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                <LinkedinIcon className="h-4 w-4" /> LinkedIn
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicPortfolio;
