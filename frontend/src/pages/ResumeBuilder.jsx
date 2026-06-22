import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Sparkles,
  Download,
  Save,
  Plus,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

const ResumeBuilder = () => {
  const { user } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState('personal');
  
  // Template Choice
  const [template, setTemplate] = useState('modern');
  const [resumeId, setResumeId] = useState(null);

  // Resume Form State
  const [personalInfo, setPersonalInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    summary: ''
  });

  const [educationList, setEducationList] = useState([
    { degree: '', institution: '', cgpa: '', graduationYear: '' }
  ]);

  const [experienceList, setExperienceList] = useState([
    { company: '', role: '', duration: '', description: '' }
  ]);

  const [projectsList, setProjectsList] = useState([
    { title: '', technologies: '', description: '' }
  ]);

  const [skillsText, setSkillsText] = useState('');
  const [certsList, setCertsList] = useState([{ name: '', issuer: '' }]);
  const [achievementsText, setAchievementsText] = useState('');
  const [languagesText, setLanguagesText] = useState('');

  // AI assistant states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Load existing resume on mount if available
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/api/resumes');
        if (res.data && res.data.length > 0) {
          const latest = res.data[res.data.length - 1];
          setResumeId(latest.id);
          setTemplate(latest.template);
          
          const parsed = JSON.parse(latest.resumeData);
          if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
          if (parsed.education) setEducationList(parsed.education);
          if (parsed.experience) setExperienceList(parsed.experience);
          if (parsed.projects) setProjectsList(parsed.projects);
          if (parsed.skills) setSkillsText(parsed.skills.join(', '));
          if (parsed.certifications) setCertsList(parsed.certifications);
          if (parsed.achievements) setAchievementsText(parsed.achievements.join('\n'));
          if (parsed.languages) setLanguagesText(parsed.languages.join(', '));
        }
      } catch (err) {
        console.error('Failed to load resume details', err);
      }
    };
    fetchResumes();
  }, [user]);

  // Sync to build package
  const buildResumeData = () => {
    return {
      personalInfo,
      education: educationList.filter(e => e.degree || e.institution),
      experience: experienceList.filter(e => e.company || e.role),
      projects: projectsList.filter(p => p.title),
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      certifications: certsList.filter(c => c.name),
      achievements: achievementsText.split('\n').map(a => a.trim()).filter(Boolean),
      languages: languagesText.split(',').map(l => l.trim()).filter(Boolean)
    };
  };

  const handleSave = async () => {
    setFeedbackMsg({ type: '', text: '' });
    const payload = {
      template,
      atsScore: 70, // Default ATS placeholder
      resumeData: JSON.stringify(buildResumeData())
    };

    try {
      if (resumeId) {
        await api.put(`/api/resumes/${resumeId}`, payload);
        setFeedbackMsg({ type: 'success', text: 'Resume updated successfully!' });
      } else {
        const res = await api.post('/api/resumes', payload);
        setResumeId(res.data.id);
        setFeedbackMsg({ type: 'success', text: 'Resume created and saved successfully!' });
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to save resume. Please check database connection.' });
    }
  };

  const handleExportPdf = async () => {
    await handleSave(); // Save first to ensure the backend has the latest data
    if (!resumeId) return;

    try {
      const response = await api.get(`/api/resumes/${resumeId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${personalInfo.name.replace(/\s+/g, '_')}_resume.pdf`;
      link.click();
    } catch (err) {
      console.error('Failed to export PDF', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to generate PDF. Make sure OpenPDF is set up.' });
    }
  };

  // List Manipulators
  const addEdu = () => setEducationList([...educationList, { degree: '', institution: '', cgpa: '', graduationYear: '' }]);
  const removeEdu = (i) => setEducationList(educationList.filter((_, idx) => idx !== i));
  
  const addExp = () => setExperienceList([...experienceList, { company: '', role: '', duration: '', description: '' }]);
  const removeExp = (i) => setExperienceList(experienceList.filter((_, idx) => idx !== i));

  const addProj = () => setProjectsList([...projectsList, { title: '', technologies: '', description: '' }]);
  const removeProj = (i) => setProjectsList(projectsList.filter((_, idx) => idx !== i));

  const addCert = () => setCertsList([...certsList, { name: '', issuer: '' }]);
  const removeCert = (i) => setCertsList(certsList.filter((_, idx) => idx !== i));

  // AI Helpers
  const triggerAiSummary = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await api.post('/api/resumes/ai/summary', {
        role: personalInfo.summary || 'Software Developer',
        details: aiPromptInput || 'Fresh graduate looking to contribute.'
      });
      setAiResult(res.data.summary);
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'AI feature error. Ensure HF API Key is valid.' });
    } finally {
      setAiLoading(false);
    }
  };

  const triggerAiImproveProject = async (index) => {
    setAiLoading(true);
    const proj = projectsList[index];
    try {
      const res = await api.post('/api/resumes/ai/improve-project', {
        title: proj.title || 'My Project',
        description: proj.description || 'Built an application.'
      });
      
      const newList = [...projectsList];
      newList[index].description = res.data.description;
      setProjectsList(newList);
      setFeedbackMsg({ type: 'success', text: `Project "${proj.title}" optimized with AI bullets!` });
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'A.I. bullet point optimizer failed.' });
    } finally {
      setAiLoading(false);
    }
  };

  const triggerAiSkillsRewrite = async () => {
    setAiLoading(true);
    try {
      const res = await api.post('/api/resumes/ai/rewrite-skills', { skills: skillsText });
      setSkillsText(res.data.skills);
      setFeedbackMsg({ type: 'success', text: 'Skills rewritten professionally!' });
    } catch (e) {
      setFeedbackMsg({ type: 'error', text: 'AI Skills refactor failed.' });
    } finally {
      setAiLoading(false);
    }
  };

  const applySummary = () => {
    setPersonalInfo({ ...personalInfo, summary: aiResult });
    setAiResult('');
    setActiveTab('personal');
  };

  const resumeData = buildResumeData();

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AI Resume Builder</h1>
          <p className="text-slate-500 dark:text-slate-400">Fill in details and use generative A.I. triggers to optimize sections.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800"
          >
            <Save className="h-4 w-4" /> Save Draft
          </button>
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-150/50 dark:shadow-none"
          >
            <Download className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      {feedbackMsg.text && (
        <div
          className={`flex items-center gap-2 rounded-xl p-4 text-sm border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200/40 dark:bg-emerald-950/20 dark:text-emerald-400'
              : 'bg-rose-50 text-rose-600 border-rose-200/40 dark:bg-rose-950/20 dark:text-rose-400'
          }`}
        >
          {feedbackMsg.type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Split Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT CARD - Editor tabs */}
        <div className="rounded-2xl border border-slate-200/50 bg-white shadow-sm dark:border-slate-800/50 dark:bg-slate-900 lg:col-span-6">
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b border-slate-100 p-2 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'personal'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <User className="h-4 w-4" /> Info
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'education'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Education
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'experience'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="h-4 w-4" /> Experience
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'projects'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <Layers className="h-4 w-4" /> Projects
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'skills'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60'
              }`}
            >
              <Award className="h-4 w-4" /> Skills
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors shrink-0 ${
                activeTab === 'ai'
                  ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                  : 'text-purple-500 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="h-4 w-4" /> AI Assistant
            </button>
          </div>

          <div className="p-6">
            {/* 1. PERSONAL INFORMATION */}
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Contact Details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      placeholder="Mumbai, India"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">LinkedIn URL</label>
                    <input
                      type="text"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">GitHub URL</label>
                    <input
                      type="text"
                      value={personalInfo.github}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                      className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Professional Summary</label>
                  <textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    placeholder="Brief professional intro or summary..."
                  />
                </div>
              </div>
            )}

            {/* 2. EDUCATION */}
            {activeTab === 'education' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Education Details</h3>
                  <button onClick={addEdu} className="flex items-center gap-1 text-xs text-indigo-650 font-bold dark:text-indigo-400">
                    <Plus className="h-4 w-4" /> Add Academic
                  </button>
                </div>
                
                {educationList.map((edu, idx) => (
                  <div key={idx} className="relative border-b border-slate-100 pb-4 dark:border-slate-800 last:border-none space-y-3">
                    {educationList.length > 1 && (
                      <button
                        onClick={() => removeEdu(idx)}
                        className="absolute right-0 top-0 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const nl = [...educationList];
                            nl[idx].institution = e.target.value;
                            setEducationList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. IIT Bombay"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Degree / Branch</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const nl = [...educationList];
                            nl[idx].degree = e.target.value;
                            setEducationList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. B.Tech Computer Science"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">CGPA / Percentage</label>
                        <input
                          type="text"
                          value={edu.cgpa}
                          onChange={(e) => {
                            const nl = [...educationList];
                            nl[idx].cgpa = e.target.value;
                            setEducationList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. 9.1/10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Graduation Year</label>
                        <input
                          type="number"
                          value={edu.graduationYear}
                          onChange={(e) => {
                            const nl = [...educationList];
                            nl[idx].graduationYear = e.target.value;
                            setEducationList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. 2026"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3. EXPERIENCE */}
            {activeTab === 'experience' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Work Experience</h3>
                  <button onClick={addExp} className="flex items-center gap-1 text-xs text-indigo-650 font-bold dark:text-indigo-400">
                    <Plus className="h-4 w-4" /> Add Experience
                  </button>
                </div>
                
                {experienceList.map((exp, idx) => (
                  <div key={idx} className="relative border-b border-slate-100 pb-4 dark:border-slate-800 last:border-none space-y-3">
                    {experienceList.length > 1 && (
                      <button
                        onClick={() => removeExp(idx)}
                        className="absolute right-0 top-0 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const nl = [...experienceList];
                            nl[idx].company = e.target.value;
                            setExperienceList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. Google India"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role / Designation</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const nl = [...experienceList];
                            nl[idx].role = e.target.value;
                            setExperienceList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. Software Engineer Intern"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const nl = [...experienceList];
                            nl[idx].duration = e.target.value;
                            setExperienceList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. May 2024 - July 2024"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const nl = [...experienceList];
                            nl[idx].description = e.target.value;
                            setExperienceList(nl);
                          }}
                          rows={3}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="Explain what you developed, optimizing with bullet-like structures..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. PROJECTS */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Projects</h3>
                  <button onClick={addProj} className="flex items-center gap-1 text-xs text-indigo-650 font-bold dark:text-indigo-400">
                    <Plus className="h-4 w-4" /> Add Project
                  </button>
                </div>
                
                {projectsList.map((proj, idx) => (
                  <div key={idx} className="relative border-b border-slate-100 pb-4 dark:border-slate-800 last:border-none space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500">Project #{idx + 1}</span>
                      <div className="flex gap-2">
                        {projectsList.length > 1 && (
                          <button onClick={() => removeProj(idx)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const nl = [...projectsList];
                            nl[idx].title = e.target.value;
                            setProjectsList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. AI Portfolio Generator"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Technologies Used</label>
                        <input
                          type="text"
                          value={proj.technologies}
                          onChange={(e) => {
                            const nl = [...projectsList];
                            nl[idx].technologies = e.target.value;
                            setProjectsList(nl);
                          }}
                          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="e.g. React, Spring Boot, MySQL"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-650 dark:text-slate-400">Description</label>
                          <button
                            onClick={() => triggerAiImproveProject(idx)}
                            className="inline-flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold dark:bg-purple-950/40 dark:text-purple-400"
                          >
                            <Sparkles className="h-2.5 w-2.5" /> Optimize with AI Bullets
                          </button>
                        </div>
                        <textarea
                          value={proj.description}
                          onChange={(e) => {
                            const nl = [...projectsList];
                            nl[idx].description = e.target.value;
                            setProjectsList(nl);
                          }}
                          rows={3}
                          className="block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                          placeholder="Outline the implementation and accomplishments..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 5. SKILLS & CERTS */}
            {activeTab === 'skills' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technical Skills (Comma separated)</label>
                    <button
                      onClick={triggerAiSkillsRewrite}
                      className="inline-flex items-center gap-1 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold dark:bg-purple-950/40 dark:text-purple-400"
                    >
                      <Sparkles className="h-2.5 w-2.5" /> Rewrite professionally
                    </button>
                  </div>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    placeholder="Java, React.js, Spring Boot, Databases, CSS"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Certifications</label>
                    <button onClick={addCert} className="text-xs font-bold text-indigo-500 flex items-center gap-0.5">
                      <Plus className="h-3 w-3" /> Add Cert
                    </button>
                  </div>
                  {certsList.map((cert, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => {
                          const nl = [...certsList];
                          nl[idx].name = e.target.value;
                          setCertsList(nl);
                        }}
                        className="w-1/2 rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                        placeholder="Certificate Title"
                      />
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => {
                          const nl = [...certsList];
                          nl[idx].issuer = e.target.value;
                          setCertsList(nl);
                        }}
                        className="w-5/12 rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                        placeholder="Issuer (e.g. AWS)"
                      />
                      {certsList.length > 1 && (
                        <button onClick={() => removeCert(idx)} className="text-slate-400 hover:text-rose-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Key Achievements (One per line)</label>
                  <textarea
                    value={achievementsText}
                    onChange={(e) => setAchievementsText(e.target.value)}
                    rows={2}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    placeholder="Won college hackathon first prize 2025&#10;Published research paper in IEEE"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Languages (Comma separated)</label>
                  <input
                    type="text"
                    value={languagesText}
                    onChange={(e) => setLanguagesText(e.target.value)}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    placeholder="English, Hindi, German"
                  />
                </div>
              </div>
            )}

            {/* 6. AI CO-PILOT ASSISTANT */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-950/20 border border-purple-200/30">
                  <h4 className="text-sm font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> AI Professional Summary Generator
                  </h4>
                  <p className="mt-1 text-xs text-purple-600/90 dark:text-purple-300">
                    Provide your target job role in the summary field, and key accomplishments below to generate a tailored profile intro.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Enter achievements, background, or goals:</label>
                  <textarea
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-55 py-2 px-3 text-sm dark:border-slate-800 dark:bg-slate-950 outline-none"
                    placeholder="Computer Science graduate from IIT. Built fullstack web applications. Eager to work in fast paced startup environment."
                  />
                </div>

                <button
                  onClick={triggerAiSummary}
                  disabled={aiLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 font-semibold text-white hover:bg-purple-500"
                >
                  {aiLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate Professional Summary
                    </>
                  )}
                </button>

                {aiResult && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-350">Generated Output:</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">"{aiResult}"</p>
                    <button
                      onClick={applySummary}
                      className="inline-flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold"
                    >
                      <Check className="h-3 w-3" /> Apply to Resume
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CARD - Live Preview */}
        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-800/50 dark:bg-slate-900 lg:col-span-6 space-y-6">
          {/* Template Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Live Preview</h3>
            <div className="flex gap-2">
              {['modern', 'professional', 'minimal', 'corporate'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold border capitalize transition-colors ${
                    template === t
                      ? 'bg-indigo-600 text-white border-indigo-650'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* TEMPLATE CONTAINER */}
          <div className="rounded-xl border border-slate-200/60 bg-white p-6 text-slate-800 dark:text-slate-900 shadow-inner overflow-y-auto max-h-[700px] print-container">
            {/* 1. MODERN TEMPLATE */}
            {template === 'modern' && (
              <div className="space-y-4 text-xs font-sans">
                <div className="border-l-4 border-indigo-600 pl-3">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">{resumeData.personalInfo.name || 'Your Name'}</h1>
                  <p className="text-slate-600 mt-0.5">
                    {resumeData.personalInfo.email && `${resumeData.personalInfo.email} | `}
                    {resumeData.personalInfo.phone && `${resumeData.personalInfo.phone} | `}
                    {resumeData.personalInfo.location && `${resumeData.personalInfo.location}`}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {resumeData.personalInfo.linkedin && `LinkedIn: ${resumeData.personalInfo.linkedin} | `}
                    {resumeData.personalInfo.github && `GitHub: ${resumeData.personalInfo.github}`}
                  </p>
                </div>

                {resumeData.personalInfo.summary && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Summary</h3>
                    <p className="mt-1 text-slate-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Education</h3>
                    <div className="mt-1.5 space-y-2">
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="flex justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{edu.institution}</span>
                            <span className="text-slate-650"> — {edu.degree}</span>
                          </div>
                          <span className="font-semibold text-slate-600 shrink-0">
                            {edu.graduationYear} {edu.cgpa && `(GPA: ${edu.cgpa})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Experience</h3>
                    <div className="mt-1.5 space-y-2">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between font-semibold">
                            <span className="font-bold text-slate-900">{exp.company} — {exp.role}</span>
                            <span className="text-slate-550 shrink-0">{exp.duration}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.projects.length > 0 && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Projects</h3>
                    <div className="mt-1.5 space-y-2">
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span className="font-bold text-slate-900">{proj.title}</span>
                            <span className="text-slate-550 italic text-[10px] shrink-0">{proj.technologies}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Skills</h3>
                    <p className="mt-1 text-slate-700">{resumeData.skills.join(', ')}</p>
                  </div>
                )}

                {resumeData.certifications.length > 0 && (
                  <div>
                    <h3 className="font-bold text-indigo-600 tracking-wider text-[10px] uppercase">Certifications</h3>
                    <ul className="mt-1 list-disc pl-4 text-slate-700 space-y-0.5">
                      {resumeData.certifications.map((cert, i) => (
                        <li key={i}>
                          <span className="font-bold text-slate-900">{cert.name}</span> — issued by {cert.issuer}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 2. PROFESSIONAL TEMPLATE */}
            {template === 'professional' && (
              <div className="space-y-4 text-xs font-serif">
                <div className="text-center border-b border-slate-300 pb-3">
                  <h1 className="text-2xl font-bold tracking-wide uppercase text-slate-900">{resumeData.personalInfo.name || 'Your Name'}</h1>
                  <p className="text-slate-650 mt-1 flex flex-wrap justify-center gap-1.5 text-[10px]">
                    <span>{resumeData.personalInfo.email}</span>
                    {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
                  </p>
                  <p className="text-[9px] text-slate-500 italic mt-0.5 flex flex-wrap justify-center gap-2">
                    {resumeData.personalInfo.linkedin && <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>}
                    {resumeData.personalInfo.github && <span>GitHub: {resumeData.personalInfo.github}</span>}
                  </p>
                </div>

                {resumeData.personalInfo.summary && (
                  <div>
                    <h3 className="font-bold border-b border-slate-200 pb-0.5 uppercase tracking-wide text-slate-800 text-[10px]">Career Profile</h3>
                    <p className="mt-1 text-slate-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div>
                    <h3 className="font-bold border-b border-slate-200 pb-0.5 uppercase tracking-wide text-slate-800 text-[10px]">Academic Background</h3>
                    <div className="mt-1.5 space-y-2">
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <span className="font-bold text-slate-900">{edu.institution}</span>
                            <span className="text-slate-600 text-[11px] italic"> — {edu.degree}</span>
                          </div>
                          <span className="text-slate-700 text-[10px] font-semibold shrink-0">
                            {edu.graduationYear} {edu.cgpa && `| GPA: ${edu.cgpa}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div>
                    <h3 className="font-bold border-b border-slate-200 pb-0.5 uppercase tracking-wide text-slate-800 text-[10px]">Professional Experience</h3>
                    <div className="mt-1.5 space-y-3">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">{exp.company}</span>
                            <span className="text-slate-650 text-[10px] shrink-0">{exp.duration}</span>
                          </div>
                          <p className="text-slate-800 font-semibold italic text-[10px]">{exp.role}</p>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.projects.length > 0 && (
                  <div>
                    <h3 className="font-bold border-b border-slate-200 pb-0.5 uppercase tracking-wide text-slate-800 text-[10px]">Technical Projects</h3>
                    <div className="mt-1.5 space-y-3">
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">{proj.title}</span>
                            <span className="text-slate-600 italic text-[10px] shrink-0">{proj.technologies}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold border-b border-slate-200 pb-0.5 uppercase tracking-wide text-slate-800 text-[10px]">Technical Competencies</h3>
                    <p className="mt-1.5 text-slate-700 leading-relaxed">{resumeData.skills.join('  •  ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. MINIMAL TEMPLATE */}
            {template === 'minimal' && (
              <div className="space-y-4 text-xs font-mono">
                <div className="text-center">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{resumeData.personalInfo.name || 'Your Name'}</h1>
                  <p className="text-slate-650 mt-1 text-[10px]">
                    {resumeData.personalInfo.email} | {resumeData.personalInfo.phone} | {resumeData.personalInfo.location}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {resumeData.personalInfo.linkedin && `ln: ${resumeData.personalInfo.linkedin} | `}
                    {resumeData.personalInfo.github && `gh: ${resumeData.personalInfo.github}`}
                  </p>
                </div>

                {resumeData.personalInfo.summary && (
                  <div className="border-t border-dashed border-slate-350 pt-2">
                    <p className="text-slate-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div className="border-t border-dashed border-slate-350 pt-2 space-y-1">
                    <h3 className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">=== EDUCATION ===</h3>
                    {resumeData.education.map((edu, i) => (
                      <div key={i} className="flex justify-between text-[11px]">
                        <span>{edu.institution} - {edu.degree}</span>
                        <span className="shrink-0">{edu.graduationYear}</span>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div className="border-t border-dashed border-slate-350 pt-2 space-y-2">
                    <h3 className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">=== EXPERIENCE ===</h3>
                    {resumeData.experience.map((exp, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{exp.company} - {exp.role}</span>
                          <span className="shrink-0">{exp.duration}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.projects.length > 0 && (
                  <div className="border-t border-dashed border-slate-350 pt-2 space-y-2">
                    <h3 className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">=== PROJECTS ===</h3>
                    {resumeData.projects.map((proj, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{proj.title} [{proj.technologies}]</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div className="border-t border-dashed border-slate-350 pt-2">
                    <h3 className="font-bold text-slate-900 tracking-wider text-[10px] uppercase">=== SKILLS ===</h3>
                    <p className="mt-1 text-slate-700">{resumeData.skills.join(', ')}</p>
                  </div>
                )}
              </div>
            )}

            {/* 4. CORPORATE TEMPLATE */}
            {template === 'corporate' && (
              <div className="grid grid-cols-12 gap-4 text-xs font-sans">
                {/* Left Sidebar */}
                <div className="col-span-4 border-r border-slate-200 pr-3 space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-bold text-slate-900 text-sm tracking-tight">{resumeData.personalInfo.name || 'Your Name'}</h2>
                    <p className="text-[10px] text-slate-500 font-medium">Aspiring Engineer</p>
                  </div>
                  
                  <div className="space-y-2 text-[10px] text-slate-650">
                    <h4 className="font-bold text-indigo-750 uppercase tracking-wider text-[9px]">Contact Info</h4>
                    <p className="break-all">{resumeData.personalInfo.email}</p>
                    <p>{resumeData.personalInfo.phone}</p>
                    <p>{resumeData.personalInfo.location}</p>
                    <p className="break-all">{resumeData.personalInfo.linkedin}</p>
                    <p className="break-all">{resumeData.personalInfo.github}</p>
                  </div>

                  {resumeData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-indigo-750 uppercase tracking-wider text-[9px]">Key Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.map((s, idx) => (
                          <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-800 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.languages.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-indigo-750 uppercase tracking-wider text-[9px]">Languages</h4>
                      <p className="text-[10px] text-slate-750 font-medium">{resumeData.languages.join(', ')}</p>
                    </div>
                  )}
                </div>

                {/* Right Main Panel */}
                <div className="col-span-8 space-y-4">
                  {resumeData.personalInfo.summary && (
                    <div className="space-y-1">
                      <h3 className="font-bold text-indigo-750 text-[10px] uppercase tracking-wider">Executive Summary</h3>
                      <p className="text-slate-700 leading-relaxed">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {resumeData.education.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-indigo-750 text-[10px] uppercase tracking-wider">Education History</h3>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{edu.institution}</span>
                            <span className="text-slate-600 font-semibold">{edu.graduationYear}</span>
                          </div>
                          <p className="text-slate-700">{edu.degree} {edu.cgpa && `| GPA: ${edu.cgpa}`}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.experience.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-bold text-indigo-750 text-[10px] uppercase tracking-wider">Work Experience</h3>
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.company} — {exp.role}</span>
                            <span className="text-slate-600 font-semibold">{exp.duration}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.projects.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-bold text-indigo-750 text-[10px] uppercase tracking-wider">Academic Projects</h3>
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{proj.title}</span>
                            <span className="text-[10px] italic text-indigo-600">{proj.technologies}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
