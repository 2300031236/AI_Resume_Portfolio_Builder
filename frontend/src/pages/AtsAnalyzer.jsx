import React, { useState } from 'react';
import api from '../services/api';
import { ScanEye, Sparkles, CheckCircle, AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';

const AtsAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!resumeText || !jobDescription) {
      setError('Please provide both the resume text and the job description.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/ats/analyze', { resumeText, jobDescription });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Ensure the Hugging Face service is online.');
    } finally {
      setLoading(false);
    }
  };

  // Score styling helper
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 border-emerald-500';
    if (score >= 50) return 'text-amber-500 border-amber-500';
    return 'text-rose-500 border-rose-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">ATS Score Analyzer</h1>
        <p className="text-slate-500 dark:text-slate-400">Match your resume text against a target Job Description to discover keyword match rates.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Input Panel */}
        <form onSubmit={handleAnalyze} className="space-y-4 lg:col-span-7 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-350">Resume Content (Paste text)</label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              rows={8}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-400"
              placeholder="Paste your education, skills, and experience sections here..."
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-350">Target Job Description (JD)</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-400"
              placeholder="Paste the target job post details, requirements, and responsibilities..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white hover:from-indigo-500 hover:to-violet-500"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <ScanEye className="h-5 w-5" /> Calculate ATS Match
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {!result && !loading && (
            <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8">
              <ScanEye className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No Analysis Done</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Enter your resume text and target Job Description on the left, then click analyze to see details.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center p-8">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-full w-full animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400"></div>
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="mt-4 font-bold text-slate-850 dark:text-slate-200">Analyzing Match Percentage</h4>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Gemma-4 is extracting keywords and checking optimization rules...</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Score Gauge */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center text-center">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">ATS Compatibility Score</h3>
                
                {/* Dial structure */}
                <div className={`flex h-28 w-28 items-center justify-center rounded-full border-8 bg-slate-50 text-2xl font-extrabold dark:bg-slate-950/20 ${getScoreColor(result.atsScore)}`}>
                  {result.atsScore}%
                </div>

                <div className="mt-4 text-xs font-semibold text-slate-650 dark:text-slate-400">
                  Keyword Match: {result.keywordMatchPercentage}%
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-3 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Missing Keywords
                </h3>
                {result.missingKeywords && result.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="rounded-lg bg-rose-50/50 border border-rose-100 text-rose-650 px-2.5 py-1 text-xs font-semibold dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-emerald-600 font-semibold dark:text-emerald-400">No crucial keywords missing!</p>
                )}
              </div>

              {/* Suggestions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-3 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-indigo-500" /> Optimization Roadmaps
                </h3>
                <ul className="space-y-3">
                  {result.improvementSuggestions?.map((s, idx) => (
                    <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                      <ArrowRight className="h-3.5 w-3.5 mr-2 mt-0.5 text-indigo-500 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsAnalyzer;
