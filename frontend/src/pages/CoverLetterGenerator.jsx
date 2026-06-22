import React, { useState } from 'react';
import api from '../services/api';
import { Mail, Sparkles, Copy, Check, FileText, Send } from 'lucide-react';

const CoverLetterGenerator = () => {
  const [companyName, setCompanyName] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [letterTab, setLetterTab] = useState('cover'); // 'cover', 'internship', 'followup'
  
  // Results
  const [coverLetter, setCoverLetter] = useState('');
  const [internshipLetter, setInternshipLetter] = useState('');
  const [followUpEmail, setFollowUpEmail] = useState('');

  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setCopySuccess('');

    if (!companyName || !jobRole || !jobDescription) {
      setError('Please provide company name, job role, and job description.');
      return;
    }

    setLoading(true);

    try {
      // Fetch Cover Letter
      const coverRes = await api.post('/api/cover-letters/generate', { companyName, jobRole, jobDescription });
      setCoverLetter(coverRes.data.coverLetter);

      // Fetch Internship Letter
      const internRes = await api.post('/api/cover-letters/internship', { companyName, jobRole, jobDescription });
      setInternshipLetter(internRes.data.internshipLetter);

      // Fetch Follow-up Email
      const followRes = await api.post('/api/cover-letters/follow-up', { companyName, jobRole });
      setFollowUpEmail(followRes.data.followUpEmail);

    } catch (err) {
      console.error(err);
      setError('Failed to generate documents. Ensure Hugging Face service credentials are set up.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(type);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const getActiveText = () => {
    if (letterTab === 'cover') return coverLetter;
    if (letterTab === 'internship') return internshipLetter;
    return followUpEmail;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Cover Letter Generator</h1>
        <p className="text-slate-500 dark:text-slate-400">Generate tailored job applications and outreach emails using Generative AI.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Input form */}
        <form onSubmit={handleGenerate} className="space-y-4 lg:col-span-5 rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900">
          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              placeholder="e.g. Google India"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Job Role / Position</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              placeholder="e.g. Associate Software Engineer"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-350">Job Description / Requirements</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
              placeholder="Paste job details or primary technology expectations..."
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
                <Sparkles className="h-5 w-5" /> Generate Letters
              </>
            )}
          </button>
        </form>

        {/* Right Output card */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!coverLetter && !loading && (
            <div className="h-full rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center p-8">
              <Mail className="h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-4 font-bold text-slate-800 dark:text-slate-200">No Letters Generated</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                Fill out the company and job information, then click generate.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-center p-8">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-full w-full animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400"></div>
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="mt-4 font-bold text-slate-850 dark:text-slate-200">Drafting Letters</h4>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Drafting three personalized outreach formats...</p>
            </div>
          )}

          {coverLetter && !loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-full justify-between space-y-4">
              {/* Document selection bar */}
              <div>
                <div className="flex border-b border-slate-100 dark:border-slate-850 pb-2 mb-4 justify-between items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLetterTab('cover')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        letterTab === 'cover'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-slate-550 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" /> Cover Letter
                    </button>
                    <button
                      onClick={() => setLetterTab('internship')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        letterTab === 'internship'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-slate-550 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Internship Letter
                    </button>
                    <button
                      onClick={() => setLetterTab('followup')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                        letterTab === 'followup'
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                          : 'text-slate-550 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <Send className="h-3.5 w-3.5" /> Follow-up Email
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(getActiveText(), letterTab)}
                    className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-500 dark:text-indigo-400 shrink-0"
                  >
                    {copySuccess === letterTab ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-850 dark:bg-slate-950">
                  <pre className="text-xs text-slate-700 dark:text-slate-350 whitespace-pre-wrap font-sans leading-relaxed">
                    {getActiveText()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
