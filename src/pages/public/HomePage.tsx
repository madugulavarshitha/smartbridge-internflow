import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Rocket,
  Shield,
  UserCheck,
  GraduationCap,
  CheckCircle2,
  Layers,
  Award,
  Users,
  Compass,
  Briefcase,
  Mail,
  Phone,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const TRACKS = [
  {
    name: 'AI & Cloud',
    description: 'Generative AI, LLMs, Azure/AWS Cloud Architecture, MLOps, and scalable distributed systems.',
    color: 'from-blue-600 to-indigo-600',
    count: '295 Interns',
  },
  {
    name: 'Salesforce',
    description: 'Apex, Lightning Web Components, Sales & Service Cloud, Flow Automation, and enterprise CRM solutions.',
    color: 'from-sky-500 to-blue-600',
    count: '195 Interns',
  },
  {
    name: 'Software Engineering',
    description: 'Modern Full-Stack development, React, Node.js, Microservices, System Design, and DevOps pipelines.',
    color: 'from-emerald-600 to-teal-700',
    count: '140 Interns',
  },
  {
    name: 'IoT & Robotics',
    description: 'Embedded Systems, Sensors, MQTT protocols, Edge Computing, and industrial automation.',
    color: 'from-amber-500 to-orange-600',
    count: '60 Interns',
  },
  {
    name: 'ServiceNow',
    description: 'ITSM, ITOM, workflows, client scripting, custom business rules, and enterprise service portals.',
    color: 'from-purple-600 to-indigo-700',
    count: '75 Interns',
  },
  {
    name: 'Business Intelligence',
    description: 'Power BI, Tableau, Advanced SQL, Data Pipelines, Predictive Analytics, and KPI dashboards.',
    color: 'from-rose-500 to-pink-600',
    count: '90 Interns',
  },
]

const PROCESS_STEPS = [
  {
    step: 'Week 0',
    title: 'Baseline Diagnostic',
    tag: 'Preserved Baseline',
    desc: 'Comprehensive diagnostic evaluation assessing core aptitude, conceptual clarity, and domain foundation to establish the personalized growth trajectory.',
  },
  {
    step: 'Stage 1',
    title: 'Learner (Weeks 1–6)',
    tag: 'Fundamentals & Labs',
    desc: 'Structured curriculum, guided technical labs, conceptual research, and initial knowledge transfer sessions under expert supervision.',
  },
  {
    step: 'Stage 2',
    title: 'Practitioner (Weeks 7–12)',
    tag: 'Implementation',
    desc: 'Real-world assignments, architectural case studies, problem solving, troubleshooting, and foundational peer mentoring KT sessions.',
  },
  {
    step: 'Stage 3',
    title: 'Developer (Weeks 13–18)',
    tag: 'Industry Projects',
    desc: 'End-to-end development, team coordination, code reviews, structured peer mentorship, testing, and production documentation.',
  },
  {
    step: 'Stage 4',
    title: 'Professional (Weeks 19–24)',
    tag: 'Capstone & Placement',
    desc: 'Enterprise capstone defence, production deployment readiness, external mentor reviews, and career pathway transitions.',
  },
]

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-11 h-11 bg-navy rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
              <Rocket size={22} className="text-white" />
            </div>
            <div>
              <span className="font-extrabold text-navy text-lg tracking-tight block leading-tight">
                SMARTBRIDGE INTERNFLOW
              </span>
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                LaunchPad Experiential Learning System
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-navy transition-colors">About SmartBridge</a>
            <a href="#process" className="hover:text-navy transition-colors">Program Methodology</a>
            <a href="#tracks" className="hover:text-navy transition-colors">Technology Tracks</a>
            <a href="#portals" className="hover:text-navy transition-colors font-semibold text-primary">Access Portals</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-navy hover:bg-navy/90 transition-all shadow-xs whitespace-nowrap"
            >
              <Shield size={14} />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/mentor/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-xs whitespace-nowrap"
            >
              <UserCheck size={14} />
              <span>Mentor Portal</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/intern/login')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs whitespace-nowrap"
            >
              <GraduationCap size={14} />
              <span>Intern Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-blue-50/20 to-surface py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-primary text-xs font-bold tracking-wide uppercase mb-6 animate-in fade-in slide-in-from-top-2">
            <Rocket size={14} /> SmartBridge LaunchPad · Academic Year 2026–2027
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy tracking-tight leading-[1.15] mb-6">
            Accelerating Future Tech Talent <br className="hidden sm:inline" />
            Through <span className="text-primary">Experiential Mentorship</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed mb-12">
            A comprehensive enterprise learning platform that powers the 24-week SmartBridge LaunchPad program.
            Connecting students, expert mentors, and program directors into one seamless, data-driven ecosystem.
          </p>

          {/* Three Portals Access Highlight */}
          <div id="portals" className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-4">
            {/* Admin Portal Card */}
            <div
              onClick={() => navigate('/admin/login')}
              className="group bg-white rounded-2xl p-7 border-2 border-slate-100 hover:border-navy shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-navy/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="w-14 h-14 rounded-xl bg-navy/10 text-navy flex items-center justify-center mb-5 group-hover:bg-navy group-hover:text-white transition-colors">
                  <Shield size={26} />
                </div>
                <Badge variant="navy" size="sm" className="mb-2">Admin Portal</Badge>
                <h3 className="text-xl font-bold text-navy mb-2">Program Administration</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Cohort governance, intern &amp; mentor provisioning, track-wise attendance analytics, KPI monitoring, and mentor assignments.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <Button
                  icon={<Shield size={16} />}
                  className="w-full justify-center bg-navy hover:bg-navy/90 text-white font-bold text-sm shadow-xs py-2.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/admin/login')
                  }}
                >
                  Admin Sign In Portal
                </Button>
              </div>
            </div>

            {/* Mentor Portal Card */}
            <div
              onClick={() => navigate('/mentor/login')}
              className="group bg-white rounded-2xl p-7 border-2 border-slate-100 hover:border-primary shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <UserCheck size={26} />
                </div>
                <Badge variant="primary" size="sm" className="mb-2">Mentor Portal</Badge>
                <h3 className="text-xl font-bold text-navy mb-2">Mentor Workspace</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Manage assigned interns, conduct stage evaluations, assign technical tasks, verify milestones, and review project submissions.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <Button
                  icon={<UserCheck size={16} />}
                  className="w-full justify-center bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-xs py-2.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/mentor/login')
                  }}
                >
                  Mentor Sign In Portal
                </Button>
              </div>
            </div>

            {/* Intern Portal Card */}
            <div
              onClick={() => navigate('/intern/login')}
              className="group bg-white rounded-2xl p-7 border-2 border-slate-100 hover:border-emerald-600 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              <div>
                <div className="w-14 h-14 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <GraduationCap size={26} />
                </div>
                <Badge variant="success" size="sm" className="mb-2">Intern Portal</Badge>
                <h3 className="text-xl font-bold text-navy mb-2">Intern Learning Hub</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Connect with your assigned mentor, track 24-week stage progression, view L-B-S-S KPI scores, and complete assigned challenges.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <Button
                  icon={<GraduationCap size={16} />}
                  className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs py-2.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/intern/login')
                  }}
                >
                  Intern Sign In Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About SmartBridge Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary tracking-wider uppercase mb-3">
                <Compass size={14} /> Building the Future of Workforce Development
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight mb-5 leading-snug">
                Building Sustainable Talent Pipelines for Emerging Industries
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Founded in 2015, SmartBridge is a pioneering workforce development organization and talent accelerator that bridges the gap between academia and global industry. In strategic alliances with world technology leaders—including Google Developers, Salesforce, AWS, ServiceNow, and IBM—SmartBridge empowers learners with future-ready skills, experiential learning, and direct career pathways.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Through the <strong>LaunchPad Experiential System</strong>, SmartBridge provides academic institutions and enterprise partners with complete institutional governance, verifiable evaluation trails, objective KPI scoring (Learn, Build, Share, Showcase), and direct mentor-to-intern accountability.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-gray-100">
                  <p className="text-3xl font-black text-navy">1M+</p>
                  <p className="text-xs font-medium text-muted mt-1">Learners Impacted Globally</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-gray-100">
                  <p className="text-3xl font-black text-primary">4,000+</p>
                  <p className="text-xs font-medium text-muted mt-1">Partner Colleges &amp; Universities</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-gray-100">
                  <p className="text-3xl font-black text-emerald-600">100+</p>
                  <p className="text-xs font-medium text-muted mt-1">Global Tech Alliances</p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-gray-100">
                  <p className="text-3xl font-black text-amber-500">500K+</p>
                  <p className="text-xs font-medium text-muted mt-1">Virtual Projects &amp; Internships</p>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="space-y-4">
              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                    <Layers size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-base mb-1">Experiential &amp; Project-Based Skilling</h4>
                    <p className="text-sm text-muted leading-relaxed">
                      Moving beyond theoretical instruction through structured virtual internships, live engineering labs, real-world case studies, and hands-on deliverables.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-base mb-1">Curriculum &amp; Credit Integration</h4>
                    <p className="text-sm text-muted leading-relaxed">
                      Partnering with 4,000+ academic institutions to embed industry-aligned emerging technology tracks directly into university credits and academic milestones.
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Award size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-base mb-1">Industry Alliances &amp; Career Outcomes</h4>
                    <p className="text-sm text-muted leading-relaxed">
                      Official workforce skilling partnerships with Google, Salesforce, AWS, IBM, and ServiceNow to deliver verified credentials and talent pipelines.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Program Process Stepper */}
      <section id="process" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="primary" className="mb-2">Structured Roadmap</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              The 24-Week LaunchPad Process
            </h2>
            <p className="text-muted text-sm sm:text-base mt-2">
              A systematic progression model engineered to transition college graduates into high-performing industry practitioners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((step, idx) => (
              <div
                key={step.step}
                className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-md bg-navy text-white">
                      {step.step}
                    </span>
                    <span className="text-xs font-semibold text-primary">{idx + 1}/5</span>
                  </div>
                  <h4 className="font-bold text-navy text-base mb-1">{step.title}</h4>
                  <p className="text-[11px] font-semibold text-emerald-600 uppercase mb-3">{step.tag}</p>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Tracks Showcase */}
      <section id="tracks" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="navy" className="mb-2">Enterprise Curricula</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy tracking-tight">
              6 Specialized Technology Tracks
            </h2>
            <p className="text-muted text-sm sm:text-base mt-2">
              Industry-aligned specializations configured with dedicated faculty, mentors, and enterprise platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TRACKS.map((track) => (
              <div
                key={track.name}
                className="bg-surface rounded-2xl p-6 border border-gray-100 hover:border-gray-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-navy bg-white px-3 py-1 rounded-full border border-gray-200">
                      {track.count}
                    </span>
                    <Briefcase size={16} className="text-primary" />
                  </div>
                  <h4 className="font-bold text-navy text-lg mb-2">{track.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">{track.description}</p>
                </div>
                <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Enrolled &amp; Active</span>
                  <CheckCircle2 size={15} className="text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SmartBridge Official Footer */}
      <footer className="bg-[#1e293b] text-white pt-14 pb-10 px-4 sm:px-6 lg:px-8 border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-700/60">
          {/* Column 1: Brand & Social */}
          <div className="space-y-4">
            <img
              src="/smartbridge-logo.png"
              alt="SmartBridge - Let's Bridge the Gap"
              className="h-12 w-auto object-contain brightness-105"
            />
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-2">
              Founded in 2015, SmartBridge is a talent accelerator building an AI-first skilling ecosystem.
              We create job-ready talent through industry-aligned, project-based learning with partners across
              industry, academia and strategic alliances.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/smartbridge-educational-services-pvt-ltd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-[#0077b5] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/smartbridgeSB/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-[#1877f2] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/thesmartbridge/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </a>
              {/* X */}
              <a
                href="https://x.com/thesmartbridge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-black flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label="X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@thesmartbridge"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded bg-[#ff0000] flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Privacy & TOS */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Privacy &amp; TOS</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="https://www.thesmartbridge.com/privacypolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors block"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.thesmartbridge.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors block"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Initiatives & Partner With Us */}
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">OUR INITIATIVES</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href="https://www.thesmartbridge.com/creditcourses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    Credit Courses
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.thesmartbridge.com/virtualinternship"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    Virtual Internship Programs
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.thesmartbridge.com/lastmile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    LastMile
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">PARTNER WITH US</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <a
                    href="https://www.thesmartbridge.com/partner-industry"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    Industry
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.thesmartbridge.com/partner-academia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    Academia
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.thesmartbridge.com/partner-government"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors block"
                  >
                    Government
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">CONTACT US</h4>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wide mb-1">INDIA OFFICE</p>
                <p className="text-slate-300 leading-relaxed mb-2">
                  <strong className="text-white font-medium">Hyderabad:</strong> 6th Floor, Sundarayya Vignana Kendram,
                  Technical Block, Madhava Reddy Colony, Gachibowli, Hyderabad, Telangana - 500032
                </p>
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-white font-medium">Noida:</strong> 3rd Floor, Big Box Co-working Space,
                  Office no 303, Pinnacle Tower - 142, Plot no. 8, Sector 142, Noida, Uttar Pradesh 201301
                </p>
              </div>

              <div>
                <p className="font-bold text-white text-xs uppercase tracking-wide mb-1">SINGAPORE OFFICE</p>
                <p className="text-slate-300 leading-relaxed">
                  78 Bayshore Rd, #18-24, Singapore 469991
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-slate-400 shrink-0" />
                  <a
                    href="mailto:info@thesmartbridge.com"
                    className="text-slate-300 hover:text-white transition-colors text-xs"
                  >
                    info@thesmartbridge.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-slate-400 shrink-0" />
                  <a
                    href="tel:+918712034656"
                    className="text-slate-300 hover:text-white transition-colors text-xs"
                  >
                    +91 8712034656
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 SMARTBRIDGE Educational Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/login')}
              className="hover:text-white transition-colors"
            >
              Admin Portal
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/mentor/login')}
              className="hover:text-white transition-colors"
            >
              Mentor Workspace
            </button>
            <span>•</span>
            <button
              onClick={() => navigate('/intern/login')}
              className="hover:text-white transition-colors text-emerald-400"
            >
              Intern Hub
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
