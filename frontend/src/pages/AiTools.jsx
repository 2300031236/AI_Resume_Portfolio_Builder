import React, { useState } from 'react';
import api from '../services/api';
import { Wrench, Sparkles, Copy, Check, HelpCircle, User, BookOpen } from 'lucide-react';

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

const AiTools = () => {
  const [activeTab, setActiveTab] = useState('linkedin-headline');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [role, setRole] = useState('Software Engineer');
  const [skills, setSkills] = useState('Java, React, SQL');
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('Academic projects, React-based fullstack tools');
  
  const [projTitle, setProjTitle] = useState('AI Resume Builder');
  const [techStack, setTechStack] = useState('React, Spring Boot, MySQL');
  const [features, setFeatures] = useState('Secure registrations, ATS score analytics, PDF exports');

  const triggerTool = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');
    setCopySuccess(false);

    try {
      let endpoint = '';
      let payload = {};

      if (activeTab === 'linkedin-headline') {
        endpoint = '/api/ai-tools/linkedin-headline';
        payload = { role, skills };
      } else if (activeTab === 'linkedin-about') {
        endpoint = '/api/ai-tools/linkedin-about';
        payload = { name, role, skills, experience };
      } else if (activeTab === 'github-description') {
        endpoint = '/api/ai-tools/github-description';
        payload = { projectTitle: projTitle, techStack, features };
      } else if (activeTab === 'mock-questions') {
        endpoint = '/api/ai-tools/interview-questions';
        payload = { role, skills };
      } else if (activeTab === 'hr-prep') {
        endpoint = '/api/ai-tools/interview-prep/hr';
        payload = {};
      } else if (activeTab === 'tech-prep') {
        endpoint = '/api/ai-tools/interview-prep/technical';
        payload = { role };
      }

      const res = await api.post(endpoint, payload);
      
      // The keys vary in responses based on the endpoint:
      if (res.data.headlines) setResult(res.data.headlines);
      else if (res.data.about) setResult(res.data.about);
      else if (res.data.description) setResult(res.data.description);
      else if (res.data.questions) setResult(res.data.questions);
      else if (res.data.prepGuide) setResult(res.data.prepGuide);

    } catch (err) {
      console.error(err);
      setError('Failed to generate results. Make sure backend model configurations are online.');
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Profile Tools</h1>
        <p className="text-slate-500 dark:text-slate-400">Optimize your LinkedIn profile, GitHub readmes, and prepare for placement rounds.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left tabs selection */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/50 bg-white p-4 shadow-sm dark:border-slate-850 dark:bg-slate-900 space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 px-2">Select AI Tool</h3>
          <button
            onClick={() => { setActiveTab('linkedin-headline'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'linkedin-headline'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <LinkedinIcon className="h-4 w-4 text-sky-600" /> LinkedIn Headline
          </button>
          <button
            onClick={() => { setActiveTab('linkedin-about'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'linkedin-about'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <LinkedinIcon className="h-4 w-4 text-sky-600" /> LinkedIn About Me
          </button>
          <button
            onClick={() => { setActiveTab('github-description'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'github-description'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <GithubIcon className="h-4 w-4 text-slate-800 dark:text-slate-200" /> GitHub Description
          </button>
          <button
            onClick={() => { setActiveTab('mock-questions'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'mock-questions'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <HelpCircle className="h-4 w-4 text-emerald-600" /> Technical Mock Q&As
          </button>
          <button
            onClick={() => { setActiveTab('hr-prep'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'hr-prep'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <User className="h-4 w-4 text-purple-600" /> HR Interview Prep
          </button>
          <button
            onClick={() => { setActiveTab('tech-prep'); setResult(''); }}
            className={`flex w-full items-center gap-2 rounded-xl p-3 text-sm font-semibold transition-all ${
              activeTab === 'tech-prep'
                ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <BookOpen className="h-4 w-4 text-amber-600" /> Technical Study Plan
          </button>
        </div>

        {/* Middle Input panel & Right Output card combined */}
        <div className="lg:col-span-8 grid gap-4 flex-col">
          <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4">Input Specifications</h3>
            
            <form onSubmit={triggerTool} className="space-y-4">
              {/* Conditional Inputs */}
              {(activeTab === 'linkedin-headline' || activeTab === 'linkedin-about' || activeTab === 'mock-questions' || activeTab === 'tech-prep') && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technical Skills</label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'linkedin-about' && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      placeholder="Alex Mercer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Notable Experiences</label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'github-description' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Project Title</label>
                      <input
                        type="text"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technology Stack</label>
                      <input
                        type="text"
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Core Features</label>
                    <input
                      type="text"
                      value={features}
                      onChange={(e) => setFeatures(e.target.value)}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tips for no-input endpoints */}
              {(activeTab === 'hr-prep') && (
                <p className="text-xs text-slate-500 dark:text-slate-400">No inputs needed. Click generate to get a quick HR study guide.</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white hover:from-indigo-500 hover:to-violet-500"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" /> Generate Output
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Result Container */}
          {result && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center border-b pb-2 dark:border-slate-850">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Generated AI Result</h4>
                <button
                  onClick={copyResult}
                  className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-500 dark:text-indigo-400"
                >
                  {copySuccess ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  <span>{copySuccess ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-850 dark:bg-slate-950">
                <pre className="text-xs text-slate-700 dark:text-slate-350 whitespace-pre-wrap font-sans leading-relaxed">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiTools;
