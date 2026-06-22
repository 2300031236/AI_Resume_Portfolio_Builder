import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import {
  FileText,
  Globe,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Play
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/api/resumes/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-400"></div>
      </div>
    );
  }

  const welcomeMessage = data?.welcomeMessage || `Welcome back, ${user?.name || 'Student'}!`;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-lg md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> Gen-AI Powered
            </span>
            <h1 className="mt-3 text-2xl font-bold md:text-3xl">{welcomeMessage}</h1>
            <p className="mt-1 text-indigo-100/90 max-w-lg text-sm md:text-base">
              Build ATS-optimized resumes, launch a personal portfolio site, and consult your AI Career Advisor to prep for placement.
            </p>
          </div>
          <Link
            to="/resume-builder"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600 transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" /> Build Resume
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900 flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mr-4">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resumes Created</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data?.resumeCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900 flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mr-4">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Portfolios Published</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data?.portfolioCount ?? 0}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900 flex items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 mr-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg ATS Score</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{data?.avgAtsScore ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            Recent Activity
          </h2>
          <ul className="space-y-4">
            {data?.recentActivity?.map((activity, index) => (
              <li key={index} className="flex items-start text-sm text-slate-650 dark:text-slate-400">
                <div className="mr-3 mt-1 h-2 w-2 rounded-full bg-indigo-500"></div>
                <span>{activity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" /> Career Recommendations
            </h2>
            <div className="space-y-2">
              {data?.careerRecommendations?.map((rec, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
                >
                  {rec}
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/career-advisor"
            className="mt-6 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Consult AI Advisor <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
