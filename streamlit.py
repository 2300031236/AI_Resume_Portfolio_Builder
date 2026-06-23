import streamlit as st
import requests
import json

# Configure Streamlit Page
st.set_page_config(
    page_title="ResuAI Builder - AI Resume & Portfolio Builder",
    page_icon="✨",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Backend URL config
# Checks for Streamlit secrets first, falls back to localhost.
# Also provides a sidebar input to change the URL.
default_api_url = "http://localhost:8081"
try:
    if "API_BASE_URL" in st.secrets:
        default_api_url = st.secrets["API_BASE_URL"]
except Exception:
    pass

API_BASE_URL = st.sidebar.text_input(
    "🔗 Backend API URL", 
    value=default_api_url, 
    help="Change this to your hosted backend URL if deploying to the cloud."
)

# Initialize Session State
if "token" not in st.session_state:
    st.session_state.token = None
if "user" not in st.session_state:
    st.session_state.user = None
if "page" not in st.session_state:
    st.session_state.page = "Dashboard"

# API Helpers
def get_headers():
    headers = {"Content-Type": "application/json"}
    if st.session_state.token:
        headers["Authorization"] = f"Bearer {st.session_state.token}"
    return headers

def api_post(endpoint, data, auth=True):
    try:
        url = f"{API_BASE_URL}{endpoint}"
        headers = get_headers() if auth else {"Content-Type": "application/json"}
        response = requests.post(url, json=data, headers=headers, timeout=15)
        return response
    except requests.exceptions.ConnectionError:
        st.error("Error: Could not connect to the backend server. Please verify the Spring Boot backend is running on port 8081.")
        return None
    except Exception as e:
        st.error(f"Request failed: {str(e)}")
        return None

def api_get(endpoint):
    try:
        url = f"{API_BASE_URL}{endpoint}"
        response = requests.get(url, headers=get_headers(), timeout=15)
        return response
    except requests.exceptions.ConnectionError:
        st.error("Error: Could not connect to the backend server. Please verify the Spring Boot backend is running on port 8081.")
        return None
    except Exception as e:
        st.error(f"Request failed: {str(e)}")
        return None

# Custom CSS for modern styling
st.markdown("""
<style>
    .main {
        background-color: #0f172a;
        color: #f1f5f9;
    }
    .stButton>button {
        border-radius: 12px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border: none;
        padding: 8px 20px;
        font-weight: 600;
        transition: all 0.3s;
    }
    .stButton>button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        color: white;
    }
    .glass-card {
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 16px;
        padding: 24px;
        margin-bottom: 20px;
    }
    h1, h2, h3 {
        font-family: 'Outfit', sans-serif;
    }
</style>
""", unsafe_allow_html=True)

# Authentication logic
def login_user(email, password):
    res = api_post("/api/auth/login", {"email": email, "password": password}, auth=False)
    if res and res.status_code == 200:
        data = res.json()
        st.session_state.token = data.get("token")
        st.session_state.user = {
            "id": data.get("id"),
            "name": data.get("name"),
            "email": data.get("email"),
            "profileImageUrl": data.get("profileImageUrl")
        }
        st.success("Login Successful!")
        st.rerun()
    elif res:
        st.error("Login Failed: Please check your credentials.")

def register_user(name, email, password):
    res = api_post("/api/auth/register", {"name": name, "email": email, "password": password}, auth=False)
    if res and res.status_code == 200:
        st.success("Registration Successful! Please sign in using the login tab.")
    elif res:
        st.error(res.text or "Registration Failed. Email may already be in use.")

# Logout logic
def logout_user():
    st.session_state.token = None
    st.session_state.user = None
    st.session_state.page = "Dashboard"
    st.rerun()

# Side Navigation & Profile
if not st.session_state.token:
    # Auth forms when logged out
    st.title("✨ ResuAI Builder")
    st.subheader("ATS-Optimized Resumes & AI Career Advisor")
    
    tab1, tab2 = st.tabs(["🔑 Sign In", "📝 Create Account"])
    
    with tab1:
        with st.form("login_form"):
            email = st.text_input("Email Address", placeholder="alex@university.edu")
            password = st.text_input("Password", type="password", placeholder="Min 6 characters")
            submit = st.form_submit_button("Sign In")
            if submit:
                if not email or not password:
                    st.warning("Please fill in all fields.")
                else:
                    login_user(email, password)
                    
    with tab2:
        with st.form("register_form"):
            name = st.text_input("Full Name", placeholder="Alex Mercer")
            reg_email = st.text_input("Email Address", placeholder="alex@university.edu")
            reg_password = st.text_input("Password", type="password", placeholder="Min 6 characters")
            confirm_password = st.text_input("Confirm Password", type="password", placeholder="Confirm password")
            submit_reg = st.form_submit_button("Create Account")
            if submit_reg:
                if not name or not reg_email or not reg_password or not confirm_password:
                    st.warning("Please fill in all fields.")
                elif reg_password != confirm_password:
                    st.error("Passwords do not match.")
                elif len(reg_password) < 6:
                    st.error("Password must be at least 6 characters long.")
                else:
                    register_user(name, reg_email, reg_password)
else:
    # Sidebar navigation for logged-in user
    with st.sidebar:
        st.title("✨ ResuAI")
        
        # User details card
        user = st.session_state.user
        avatar_url = user.get("profileImageUrl") or f"https://api.dicebear.com/7.x/adventurer/svg?seed={user.get('name')}"
        
        st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 12px;">
            <img src="{avatar_url}" style="width: 45px; height: 45px; border-radius: 50%;" />
            <div style="overflow: hidden;">
                <p style="margin: 0; font-weight: 600; color: #fff; font-size: 14px;">{user.get('name')}</p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">{user.get('email')}</p>
            </div>
        </div>
        """, unsafe_allow_html=True)

        pages = [
            "Dashboard", 
            "Resume Builder", 
            "ATS Score Analyzer", 
            "Cover Letter Generator", 
            "Portfolio Configurator",
            "AI Career Advisor",
            "AI Branding Tools"
        ]
        
        for p in pages:
            if st.button(p, use_container_width=True, type="secondary" if st.session_state.page != p else "primary"):
                st.session_state.page = p
                st.rerun()
                
        st.write("---")
        if st.button("🚪 Sign Out", use_container_width=True):
            logout_user()

    # PAGES RENDERING
    if st.session_state.page == "Dashboard":
        st.title("📊 Personal Placement Dashboard")
        res = api_get("/api/resumes/dashboard")
        
        if res and res.status_code == 200:
            data = res.json()
            welcome = data.get("welcomeMessage", f"Welcome back, {st.session_state.user.get('name')}!")
            st.subheader(welcome)
            
            # Stats Grid
            c1, c2, c3 = st.columns(3)
            with c1:
                st.markdown(f"""
                <div class="glass-card" style="text-align: center;">
                    <h5 style="color: #94a3b8; margin-bottom: 8px;">Resumes Created</h5>
                    <h2 style="color: #6366f1; margin: 0; font-size: 36px;">{data.get('resumeCount', 0)}</h2>
                </div>
                """, unsafe_allow_html=True)
            with c2:
                st.markdown(f"""
                <div class="glass-card" style="text-align: center;">
                    <h5 style="color: #94a3b8; margin-bottom: 8px;">Portfolios Published</h5>
                    <h2 style="color: #10b981; margin: 0; font-size: 36px;">{data.get('portfolioCount', 0)}</h2>
                </div>
                """, unsafe_allow_html=True)
            with c3:
                st.markdown(f"""
                <div class="glass-card" style="text-align: center;">
                    <h5 style="color: #94a3b8; margin-bottom: 8px;">Avg ATS score</h5>
                    <h2 style="color: #8b5cf6; margin: 0; font-size: 36px;">{data.get('avgAtsScore', 0)}%</h2>
                </div>
                """, unsafe_allow_html=True)
            
            # Details Grid
            col_l, col_r = st.columns(2)
            with col_l:
                st.subheader("📅 Recent Activity")
                activities = data.get("recentActivity", [])
                if activities:
                    for act in activities:
                        st.markdown(f"• {act}")
                else:
                    st.info("No recent activities recorded.")
            with col_r:
                st.subheader("💡 Recommended Roles")
                recs = data.get("careerRecommendations", [])
                if recs:
                    for rec in recs:
                        st.markdown(f"- **{rec}**")
                else:
                    st.info("Complete your profile education and projects to view advisor recommendation list.")
        else:
            st.error("Failed to load dashboard statistics.")

    elif st.session_state.page == "Resume Builder":
        st.title("📝 ATS Resume Builder")
        st.markdown("Build professional portfolios and save structures to download optimized PDFs.")
        
        # Load profile values to pre-populate builder fields
        st.subheader("Personal & Academic Configurations")
        res_user = api_get("/api/auth/profile")
        user_profile = res_user.json() if res_user and res_user.status_code == 200 else {}
        
        with st.form("resume_form"):
            c1, c2 = st.columns(2)
            with c1:
                res_name = st.text_input("Name", value=user_profile.get("name", st.session_state.user.get("name")))
                res_email = st.text_input("Email", value=user_profile.get("email", st.session_state.user.get("email")))
            with c2:
                phone = st.text_input("Phone Number", placeholder="+1 (555) 019-2834")
                linkedin = st.text_input("LinkedIn Profile URL", placeholder="linkedin.com/in/username")
            
            github = st.text_input("GitHub Profile URL", placeholder="github.com/username")
            
            st.write("### 🎓 Academic History")
            degree = st.text_input("Degree/Major", placeholder="Bachelor of Science in Computer Science")
            institution = st.text_input("Institution", placeholder="State University")
            grad_year = st.number_input("Graduation Year", min_value=2000, max_value=2035, value=2026)
            
            st.write("### 🛠 Tech stack and Project Profiles")
            proj_title = st.text_input("Project Title", placeholder="AI Resume Builder")
            proj_tech = st.text_input("Technologies Used", placeholder="React, Spring Boot, MySQL")
            proj_desc = st.text_area("Project Description", placeholder="Developed a web app that does...")
            
            st.write("### 📌 Skills list")
            skills = st.text_area("Skills (Comma Separated)", placeholder="Java, Spring Boot, React, JavaScript, MySQL, Git")
            
            template = st.selectbox("Design Template", ["Modern", "Professional", "Minimal", "Corporate"])
            
            save_resume = st.form_submit_button("Save Resume Config")
            
            if save_resume:
                # Structure resume payload
                resume_payload = {
                    "template": template.lower(),
                    "atsScore": 80,
                    "resumeData": json.dumps({
                        "personalInfo": {
                            "name": res_name,
                            "email": res_email,
                            "phone": phone,
                            "linkedin": linkedin,
                            "github": github
                        },
                        "education": [{
                            "degree": degree,
                            "institution": institution,
                            "graduationYear": grad_year
                        }],
                        "projects": [{
                            "title": proj_title,
                            "technologies": proj_tech,
                            "description": proj_desc
                        }],
                        "skills": [s.strip() for s in skills.split(",") if s.strip()]
                    })
                }
                
                res_save = api_post("/api/resumes", resume_payload)
                if res_save and res_save.status_code == 200:
                    st.success("Resume details saved successfully!")
                    saved_resume = res_save.json()
                    st.session_state.last_resume_id = saved_resume.get("id")
                else:
                    st.error("Failed to save resume.")

        # PDF Download Section
        if "last_resume_id" in st.session_state:
            st.write("---")
            st.subheader("🖨 Export to PDF")
            pdf_url = f"{API_BASE_URL}/api/resumes/{st.session_state.last_resume_id}/pdf"
            
            try:
                headers = get_headers()
                pdf_res = requests.get(pdf_url, headers=headers)
                if pdf_res.status_code == 200:
                    st.download_button(
                        label="Download PDF Resume",
                        data=pdf_res.content,
                        file_name="ATS_Resume.pdf",
                        mime="application/pdf"
                    )
                else:
                    st.warning("Failed to render PDF preview from the server.")
            except Exception as e:
                st.error(f"Could not connect to PDF downloader: {str(e)}")

    elif st.session_state.page == "ATS Score Analyzer":
        st.title("🎯 AI ATS Score Analyzer")
        st.write("Compare your resume content against a job description description to evaluate ATS compliance.")
        
        col_l, col_r = st.columns(2)
        with col_l:
            resume_txt = st.text_area("Paste Resume Text", height=300, placeholder="Copy paste your full resume content here...")
        with col_r:
            jd_txt = st.text_area("Paste Job Description", height=300, placeholder="Paste the target job description details here...")
            
        if st.button("Analyze ATS Compatibility"):
            if not resume_txt or not jd_txt:
                st.warning("Please fill in both text blocks.")
            else:
                with st.spinner("Evaluating keywords and computing ATS compatibility..."):
                    payload = {"resumeText": resume_txt, "jobDescription": jd_txt}
                    res = api_post("/api/ats/analyze", payload)
                    
                    if res and res.status_code == 200:
                        data = res.json()
                        st.subheader(f"ATS Compliance: {data.get('atsScore', 0)}%")
                        st.progress(data.get("atsScore", 0) / 100)
                        
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write("### 🔍 Missing Keywords")
                            missing = data.get("missingKeywords", [])
                            if missing:
                                for keyword in missing:
                                    st.error(keyword)
                            else:
                                st.success("No critical keywords missing!")
                        with col2:
                            st.write("### 📈 Recommended Suggestions")
                            tips = data.get("improvementSuggestions", [])
                            for tip in tips:
                                st.info(tip)
                    else:
                        st.error("Failed to run ATS Analyzer.")

    elif st.session_state.page == "Cover Letter Generator":
        st.title("✉️ AI Cover Letter Generator")
        st.write("Generate professional, tailored cover letters instantaneously.")
        
        with st.form("cover_letter_form"):
            c_name = st.text_input("Company Name", placeholder="Google / Microsoft / Local Startup")
            role = st.text_input("Job Role", placeholder="Software Engineer Intern")
            jd = st.text_area("Job Description / Core focus", placeholder="Experience in Python and Streamlit apps...")
            submit_cl = st.form_submit_button("Generate Letter Drafts")
            
            if submit_cl:
                if not c_name or not role:
                    st.warning("Company Name and Job Role are required.")
                else:
                    with st.spinner("Drafting cover letter..."):
                        payload = {"companyName": c_name, "jobRole": role, "jobDescription": jd}
                        res = api_post("/api/cover-letters/generate", payload)
                        if res and res.status_code == 200:
                            data = res.json()
                            st.write("### Generated Cover Letter")
                            st.text_area("Copy Cover Letter", value=data.get("coverLetter", ""), height=400)
                        else:
                            st.error("Failed to generate cover letter.")

    elif st.session_state.page == "Portfolio Configurator":
        st.title("🌐 AI Portfolio Website Builder")
        st.write("Configure and publish your personal portfolio website theme layout.")
        
        with st.form("portfolio_form"):
            theme = st.selectbox("Select Theme Layout", ["Dark Mode", "Light Mode", "Sleek Glassmorphism", "Creative Gradient"])
            hero_title = st.text_input("Hero Title", placeholder="Hi, I'm Alex Mercer")
            bio = st.text_area("Short Bio Description", placeholder="Aspiring software developer specializing in backend APIs and data tools...")
            
            submit_port = st.form_submit_button("Save Portfolio configurations")
            if submit_port:
                port_payload = {
                    "theme": theme.lower().replace(" ", "_"),
                    "portfolioData": json.dumps({
                        "hero": {
                            "title": hero_title,
                            "subtitle": bio
                        }
                    })
                }
                res = api_post("/api/portfolios", port_payload)
                if res and res.status_code == 200:
                    st.success("Portfolio published successfully!")
                    user_id = st.session_state.user.get("id")
                    st.markdown(f"Public Link: `http://localhost:5173/portfolio/{user_id}`")
                else:
                    st.error("Failed to save portfolio configuration.")

    elif st.session_state.page == "AI Career Advisor":
        st.title("🧭 Gen-AI Career Advisor")
        st.write("Receive automated career tracks and skill guidelines mapped from your projects & education.")
        
        if st.button("Consult AI Career Advisor"):
            with st.spinner("Analyzing profile records and compiling learning recommendations..."):
                res = api_get("/api/career-advisor/recommendations")
                if res and res.status_code == 200:
                    data = res.json()
                    
                    st.subheader("🎯 Suggested Job Roles")
                    roles = data.get("jobRoles", [])
                    st.write(", ".join(roles))
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write("### 🛠 Missing Skills to Learn")
                        for s in data.get("missingSkills", []):
                            st.error(s)
                            
                        st.write("### 🎓 Recommended Certifications")
                        for c in data.get("certificationsToPursue", []):
                            st.success(c)
                    with col2:
                        st.write("### 📚 Study Paths")
                        for p in data.get("learningPaths", []):
                            st.info(p)
                            
                        st.write("### 💡 Interview Prep Tips")
                        for tip in data.get("preparationTips", []):
                            st.warning(tip)
                else:
                    st.error("Failed to load career advisor guidelines.")

    elif st.session_state.page == "AI Branding Tools":
        st.title("✨ AI Branding & Prep Tools")
        st.write("Quickly optimize your social brand and study for technical interviews.")
        
        tool_tab = st.selectbox("Select branding helper", ["LinkedIn Headline", "LinkedIn About", "GitHub README Setup", "Mock Technical Questions"])
        
        if tool_tab == "LinkedIn Headline":
            with st.form("headline_form"):
                role = st.text_input("Target Job Title", placeholder="Software Engineer Intern")
                skills = st.text_input("Core Skills", placeholder="Python, Django, Streamlit")
                submit = st.form_submit_button("Generate Headlines")
                if submit:
                    res = api_post("/api/ai-tools/linkedin-headline", {"role": role, "skills": skills})
                    if res and res.status_code == 200:
                        st.markdown(res.json().get("headlines", ""))
                    else:
                        st.error("Failed to generate headlines.")
                        
        elif tool_tab == "LinkedIn About":
            with st.form("about_form"):
                name = st.text_input("Name", value=st.session_state.user.get("name"))
                role = st.text_input("Target Job Title", placeholder="Data Analyst Intern")
                skills = st.text_input("Core Skills", placeholder="SQL, Tableau, Pandas")
                exp = st.text_area("Notable Projects", placeholder="Built sales analysis dashboards and data pipelines...")
                submit = st.form_submit_button("Generate Bio")
                if submit:
                    res = api_post("/api/ai-tools/linkedin-about", {"name": name, "role": role, "skills": skills, "experience": exp})
                    if res and res.status_code == 200:
                        st.write("### Generated LinkedIn About")
                        st.text_area("Copy Text", value=res.json().get("about", ""), height=300)
                    else:
                        st.error("Failed to generate bio.")
                        
        elif tool_tab == "GitHub README Setup":
            with st.form("readme_form"):
                proj = st.text_input("Project Name", placeholder="Streamlit Resume Builder")
                stack = st.text_input("Tech Stack", placeholder="Python, Streamlit, Requests")
                feats = st.text_area("Core Features", placeholder="Interactive tabs, API callbacks, PDF generation")
                submit = st.form_submit_button("Generate Setup")
                if submit:
                    res = api_post("/api/ai-tools/github-description", {"projectTitle": proj, "techStack": stack, "features": feats})
                    if res and res.status_code == 200:
                        st.markdown(res.json().get("description", ""))
                    else:
                        st.error("Failed to generate description.")
                        
        elif tool_tab == "Mock Technical Questions":
            with st.form("mock_form"):
                role = st.text_input("Target Job Title", placeholder="Junior Python Developer")
                skills = st.text_input("Focus Tech Stack", placeholder="Python, Flask, PostgreSQL")
                submit = st.form_submit_button("Generate Mock Interview")
                if submit:
                    res = api_post("/api/ai-tools/interview-questions", {"role": role, "skills": skills})
                    if res and res.status_code == 200:
                        st.markdown(res.json().get("questions", ""))
                    else:
                        st.error("Failed to generate questions.")
