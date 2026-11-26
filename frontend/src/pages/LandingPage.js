import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { ArrowUpRight, Users, Target, BarChart3, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const features = [
    {icon:Users,title:'Lead management',text:'A shared, organized view of every prospect and next step.'},
    {icon:Target,title:'Campaigns',text:'Plan outreach and follow activity across your team.'},
    {icon:BarChart3,title:'Performance',text:'See progress, activity and outcomes without noise.'},
    {icon:ShieldCheck,title:'Role-based access',text:'Give each team member the tools and view they need.'}
  ];
  return (
    <main className="telecrm-marketing">
      <section className="marketing-hero">
        <div className="marketing-hero-inner">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot"/> LEAD MANAGEMENT, WITHOUT THE CHAOS</div>
            <h1>Make the next<br/><span>move matter.</span></h1>
            <p>Leads, follow-ups, campaigns and team activity. A focused workspace that helps your sales team keep the work moving.</p>
            <div className="hero-actions">
              <button className="marketing-primary" onClick={()=>navigate('/login')}>Open TeleCRM <ArrowUpRight size={17}/></button>
              <button className="marketing-secondary" onClick={()=>navigate('/contact')}>Get in touch</button>
            </div>
          </div>
          <div className="hero-side-note">
            <span className="side-note-index">01 / THE WORKSPACE</span>
            <div className="side-note-rule"/>
            <p>Built around the people who make customer conversations happen.</p>
            <div className="side-note-roles"><span>ADMIN</span><span>MANAGER</span><span>CALLER</span><span>FIELD TEAM</span></div>
          </div>
        </div>
        <div className="hero-bottomline"><span>TELECRM.IO</span><span>LEAD · TEAM · CAMPAIGN · REPORT</span><span>01—04</span></div>
      </section>
      <section className="marketing-intro">
        <div><span className="section-kicker">BUILT FOR DAILY OPERATIONS</span><h2>Less searching.<br/>More <span>follow-through.</span></h2></div>
        <p>Keep customer context, ownership and next actions together. TeleCRM gives your team a clear view of the pipeline and a practical way to act on it.</p>
      </section>
      <section className="marketing-capabilities">
        <div className="capability-head"><span className="section-kicker">THE ESSENTIALS</span><h2>Everything connected.<br/>Nothing overcomplicated.</h2></div>
        <div className="capability-grid">{features.map(({icon:Icon,title,text},i)=><article className="capability" key={title}><div className="capability-top"><span className="cap-number">0{i+1}</span><Icon size={19}/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="marketing-cta"><div><span className="section-kicker">READY TO GET TO WORK?</span><h2>Your pipeline,<br/>with a clearer view.</h2></div><button onClick={()=>navigate('/login')}>Sign in to TeleCRM <ArrowUpRight size={18}/></button></section>
      <Footer/>
    </main>
  );
};
export default LandingPage;
