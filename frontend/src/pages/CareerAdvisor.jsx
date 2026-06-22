import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Compass, Sparkles, BookOpen, CheckSquare, Award, HelpCircle } from 'lucide-react';

const CareerAdvisor = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/api/career-advisor/recommendations');
        setResult(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch recommendations. Make sure your profile details are synced.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Career Advisor</h1>
        <p className="text-slate-500 dark:text-slate-400">Consult generative A.I. to compile custom study roadmaps, recommended certs, and mock interview tips.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-96 flex-col items-center justify-center p-8">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400"></div>
            <Compass className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
          <h4 className="mt-4 font-bold text-slate-850 dark:text-slate-200">Consulting AI Career Advisor</h4>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Analyzing your education, projects, and certifications...</p>
        </div>
      )}

      {result && !loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Suitable Job Roles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Compass className="h-5 w-5 text-indigo-500" /> Recommended Job Roles
            </h3>
            <div className="space-y-2">
              {result.jobRoles?.map((role, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-sm font-bold text-slate-850 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-350"
                >
                  {role}
                </div>
              ))}
            </div>
          </div>

          {/* Missing Skills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-indigo-500" /> Skills to Acquire
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-indigo-50/80 border border-indigo-100/50 text-indigo-750 px-3 py-1.5 text-xs font-semibold dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Learning Paths */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Suggested Learning Paths
            </h3>
            <ul className="space-y-3">
              {result.learningPaths?.map((path, idx) => (
                <li key={idx} className="flex items-start text-xs text-slate-700 dark:text-slate-350 leading-relaxed border-b last:border-none pb-2 dark:border-slate-850">
                  <span className="bg-indigo-100 text-indigo-700 rounded-full h-5 w-5 flex items-center justify-center font-bold mr-2 text-[10px] shrink-0 dark:bg-indigo-950/40 dark:text-indigo-450">
                    {idx + 1}
                  </span>
                  <span>{path}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certs to Pursue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-500" /> Certifications to Pursue
            </h3>
            <ul className="space-y-2">
              {result.certificationsToPursue?.map((cert, idx) => (
                <li key={idx} className="flex items-center text-xs text-slate-700 dark:text-slate-350 leading-relaxed">
                  <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full mr-2"></span>
                  <span>{cert}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Placement Tips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
            <h3 className="text-base font-bold text-slate-850 dark:text-slate-200 mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-500" /> Placement & Interview Prep Advice
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.preparationTips?.map((tip, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-700 leading-relaxed dark:border-slate-850 dark:bg-slate-950 dark:text-slate-350">
                  <Sparkles className="h-4 w-4 text-amber-500 mb-2" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerAdvisor;
