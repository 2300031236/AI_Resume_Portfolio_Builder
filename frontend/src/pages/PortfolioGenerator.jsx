import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Globe, Sparkles, Download, Save, Copy, Check, ExternalLink, Moon, Eye } from 'lucide-react';

const PortfolioGenerator = () => {
  const { user } = useAuth();
  
  const [theme, setTheme] = useState('modern');
  const [portfolioId, setPortfolioId] = useState(null);

  // Portfolio section states
  const [hero, setHero] = useState({ title: '', subtitle: '', bio: '' });
  const [about, setAbout] = useState({ description: '', profileImage: '' });
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [experience, setExperience] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [contact, setContact] = useState({ email: '', phone: '', github: '', linkedin: '' });

  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get('/api/portfolios');
        if (res.data) {
          setPortfolioId(res.data.id);
          setTheme(res.data.theme);
          
          const parsed = JSON.parse(res.data.portfolioData);
          if (parsed.hero) setHero(parsed.hero);
          if (parsed.about) setAbout(parsed.about);
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.projects) setProjects(parsed.projects);
          if (parsed.experience) setExperience(parsed.experience);
          if (parsed.certifications) setCertifications(parsed.certifications);
          if (parsed.contact) setContact(parsed.contact);
        }
      } catch (err) {
        console.error('Failed to load portfolio configuration', err);
      }
    };
    fetchPortfolio();
  }, [user]);

  const compileData = () => {
    return { hero, about, skills, projects, experience, certifications, contact };
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback('');
    try {
      const payload = {
        theme,
        portfolioData: JSON.stringify(compileData())
      };
      const res = await api.post('/api/portfolios', payload);
      setPortfolioId(res.data.id);
      setFeedback('Portfolio configurations saved successfully!');
    } catch (err) {
      console.error(err);
      setFeedback('Failed to save portfolio config.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compileData(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${user?.name || 'portfolio'}_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const publicUrl = `${window.location.origin}/portfolio/${user?.id || 1}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Portfolio Generator</h1>
          <p className="text-slate-500 dark:text-slate-400">Design your personal developer portfolio site and share your achievements.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadConfig}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> Download Config
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-150/50 dark:shadow-none"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/40">
          {feedback}
        </div>
      )}

      {/* Share Link Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-200/20">
        <div>
          <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Your Shareable Portfolio Website Link</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recruiters can view this live preview without signing in.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="text-xs border border-indigo-200/40 rounded-lg p-2 bg-white dark:bg-slate-950 dark:border-slate-800 w-full md:w-80 outline-none text-slate-650"
          />
          <button
            onClick={copyShareLink}
            className="flex items-center justify-center p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shrink-0"
            title="Copy link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-700 shrink-0"
            title="Open Portfolio"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form config */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-2">Layout Settings</h3>

          {/* Theme selection */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Website Theme</label>
            <div className="grid grid-cols-4 gap-2 mt-1.5">
              {['modern', 'dark', 'creative', 'sleek'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`rounded-lg py-2 text-xs font-semibold border capitalize transition-colors ${
                    theme === t
                      ? 'bg-indigo-650 text-white border-indigo-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hero Section Title</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Subtitle / Tagline</label>
              <input
                type="text"
                value={hero.subtitle}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hero Brief Bio</label>
              <textarea
                value={hero.bio}
                onChange={(e) => setHero({ ...hero, bio: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">About Me Description</label>
              <textarea
                value={about.description}
                onChange={(e) => setAbout({ ...about, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              />
            </div>

            <div className="border-t pt-3 space-y-2 dark:border-slate-800">
              <h4 className="text-xs font-bold text-indigo-650 dark:text-indigo-400">Social & Contact Links</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={contact.github}
                  onChange={(e) => setContact({ ...contact, github: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 outline-none"
                />
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={contact.linkedin}
                  onChange={(e) => setContact({ ...contact, linkedin: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 outline-none"
                />
                <input
                  type="text"
                  placeholder="Contact Email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 outline-none"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="rounded-lg border border-slate-200 bg-slate-50/50 py-2 px-3 text-xs dark:border-slate-800 dark:bg-slate-950 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live preview */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
            <h3 className="font-bold text-slate-850 dark:text-slate-200">Responsive Live Preview</h3>
            <span className="text-xs text-slate-400 font-medium">Desktop Preview</span>
          </div>

          {/* Theme preview renders */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner max-h-[600px] overflow-y-auto">
            {/* MODERN THEME */}
            {theme === 'modern' && (
              <div className="bg-slate-50 text-slate-800 min-h-[400px] font-sans">
                {/* Hero */}
                <div className="bg-gradient-to-tr from-indigo-650 to-violet-600 text-white p-8 text-center space-y-3">
                  <h1 className="text-2xl font-bold">{hero.title || 'Your Name'}</h1>
                  <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider">{hero.subtitle || 'Aspiring Web Developer'}</p>
                  <p className="text-indigo-50/90 text-xs max-w-md mx-auto leading-relaxed">{hero.bio || 'Brief intro tagline'}</p>
                </div>
                {/* About & Skills */}
                <div className="p-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">About Me</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{about.description || 'Full profile bio...'}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 border-b pb-1 text-sm">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {skills.map((s, idx) => (
                        <span key={idx} className="bg-white border text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Projects */}
                <div className="p-6 bg-white border-t space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Featured Projects</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((p, idx) => (
                      <div key={idx} className="border rounded-xl p-4 space-y-1.5 shadow-sm bg-slate-50/50">
                        <h4 className="font-bold text-xs text-indigo-700">{p.title}</h4>
                        <p className="text-[10px] text-slate-550 italic">{p.technologies}</p>
                        <p className="text-[10px] text-slate-650 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DARK THEME */}
            {theme === 'dark' && (
              <div className="bg-slate-950 text-slate-100 min-h-[400px] font-sans p-6 space-y-8">
                {/* Header info */}
                <div className="space-y-3">
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{hero.title || 'Your Name'}</h1>
                  <p className="text-slate-400 text-sm font-semibold">{hero.subtitle}</p>
                  <p className="text-slate-300 text-xs leading-relaxed max-w-xl">{hero.bio}</p>
                </div>
                {/* About & Skills */}
                <div className="grid gap-6 md:grid-cols-2 border-t border-slate-900 pt-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm">Biography</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{about.description}</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-200 text-sm">Key Skills</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s, idx) => (
                        <span key={idx} className="bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Projects */}
                <div className="border-t border-slate-900 pt-6 space-y-4">
                  <h3 className="font-bold text-slate-250 text-sm">Technical Projects</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {projects.map((p, idx) => (
                      <div key={idx} className="border border-slate-850 rounded-xl p-4 bg-slate-900/40 space-y-1.5">
                        <h4 className="font-bold text-xs text-indigo-400">{p.title}</h4>
                        <p className="text-[10px] text-slate-500">{p.technologies}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CREATIVE THEME */}
            {theme === 'creative' && (
              <div className="bg-slate-50 text-slate-800 min-h-[400px] font-sans">
                {/* Hero */}
                <div className="bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 text-white p-8 text-center space-y-4">
                  <h1 className="text-2xl font-extrabold">{hero.title || 'Your Name'}</h1>
                  <p className="text-pink-100 text-xs font-bold uppercase tracking-wider">{hero.subtitle}</p>
                  <p className="text-white/90 text-xs max-w-md mx-auto leading-relaxed">{hero.bio}</p>
                </div>
                {/* Bio card */}
                <div className="p-6 space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-2">
                    <h3 className="font-extrabold text-purple-700 text-sm">About Me</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{about.description}</p>
                  </div>
                  {/* Skills tags */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-indigo-700 text-sm">Competencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, idx) => (
                        <span key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLEEK THEME */}
            {theme === 'sleek' && (
              <div className="bg-slate-900 text-slate-100 min-h-[400px] font-mono p-8 space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h1 className="text-xl font-bold uppercase tracking-tight text-indigo-400">{hero.title || 'Your Name'}</h1>
                  <p className="text-slate-400 text-xs mt-1">{hero.subtitle}</p>
                  <p className="text-slate-450 text-[10px] mt-2 leading-relaxed max-w-md">{hero.bio}</p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-indigo-300 tracking-wider">~/about-me</span>
                  <p className="text-[10px] text-slate-350 leading-relaxed">{about.description}</p>
                </div>

                {skills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-300 tracking-wider">~/skills</span>
                    <p className="text-[10px] text-slate-350">{skills.join(' | ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioGenerator;
