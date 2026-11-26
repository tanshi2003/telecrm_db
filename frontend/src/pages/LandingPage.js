import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { ArrowUpRight, Users, Target, BarChart3, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const items = [
    {icon:Users,title:'Lead management',text:'Keep contact details, ownership, activity and follow-ups together.'},
    {icon:Target,title:'Campaigns',text:'Organize outreach and understand progress across your team.'},
    {icon:BarChart3,title:'Reporting',text:'Turn day-to-day activity into clear, useful performance signals.'},
    {icon:ShieldCheck,title:'Team access',text:'Role-based workspaces keep every team focused on their responsibilities.'}
  ];
  return <main className='telecrm-marketing'>
    <section className='marketing-hero'><div className='marketing-hero-inner'>
      <div className='hero-copy'><div className='eyebrow'><span className='eyebrow-dot'/> CUSTOMER OPERATIONS WORKSPACE</div>
        <h1>Make every lead<br/><span>count.</span></h1>
        <p>Bring your leads, campaigns and team activity into one clear workspace. Less scattered follow-up. More momentum.</p>
        <div className='hero-actions'><button className='marketing-primary' onClick={()=>navigate('/login')}>Enter workspace <ArrowUpRight size={17}/></button><button className='marketing-secondary' onClick={()=>navigate('/contact')}>Contact us</button></div>
        <div className='hero-proof'>Built for admins, managers, callers and field teams</div>
      </div>
      <div className='hero-product'><div className='product-window'><div className='product-window-top'><span className='window-brand'>T</span><span>TeleCRM / Workspace</span><span className='window-status'>● Live workspace</span></div>
        <div className='product-preview'><aside className='preview-sidebar'><div className='preview-mark'>T</div><div className='preview-nav active'>Overview</div><div className='preview-nav'>Leads</div><div className='preview-nav'>Campaigns</div><div className='preview-nav'>Reports</div></aside>
          <div className='preview-content'><div className='preview-heading'><div><small>WORKSPACE OVERVIEW</small><h3>Team performance</h3></div><span className='preview-action'>This week</span></div>
            <div className='preview-stats'><div><small>Leads</small><strong>2,486</strong><em>+12.8%</em></div><div><small>Contacted</small><strong>1,824</strong><em>+8.4%</em></div><div><small>Conversion</small><strong>18.6%</strong><em>+2.1%</em></div></div>
            <div className='preview-panel'><div className='panel-title'><strong>Lead activity</strong><span>Weekly</span></div><div className='chart-lines'><div className='chart-gridline'/><div className='chart-gridline'/><div className='chart-gridline'/><svg viewBox='0 0 460 118' preserveAspectRatio='none'><path d='M0 95 C38 90 44 75 76 82 S120 60 150 72 S194 45 220 57 S265 26 300 44 S345 21 370 33 S420 9 460 16' fill='none' stroke='#3778e8' strokeWidth='3'/><path d='M0 95 C38 90 44 75 76 82 S120 60 150 72 S194 45 220 57 S265 26 300 44 S345 21 370 33 S420 9 460 16 L460 118 L0 118Z' fill='rgba(55,120,232,.08)'/></svg></div><div className='preview-legend'><span><i/> Lead activity</span><span>Mon · Tue · Wed · Thu · Fri · Sat · Sun</span></div></div>
            <div className='preview-panel recent'><div className='panel-title'><strong>Recent activity</strong><span>Updated</span></div><div className='preview-row'><span className='mini-avatar blue'>AM</span><div><b>Arjun Mehta</b><small>New lead · Just now</small></div><label>New</label></div><div className='preview-row'><span className='mini-avatar violet'>SK</span><div><b>Sarah Khan</b><small>Follow-up · 10:18 AM</small></div><label className='neutral'>Pending</label></div></div>
          </div></div></div>
    </div></section>
    <section className='marketing-intro'><div><span className='section-kicker'>A simpler sales workflow</span><h2>Clear work.<br/>Better <span>follow-through.</span></h2></div><p>TeleCRM helps teams keep the next action visible, the right people accountable, and customer context close at hand. Designed for the work behind every successful conversation.</p></section>
    <section className='marketing-capabilities'><div className='capability-head'><span className='section-kicker'>ONE CONNECTED WORKSPACE</span><h2>Tools that work together,<br/>not in your way.</h2></div><div className='capability-grid'>{items.map(({icon:Icon,title,text})=><article className='capability' key={title}><div className='cap-icon'><Icon size={21}/></div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className='marketing-cta'><div><span className='section-kicker'>YOUR WORKSPACE IS READY</span><h2>Start with a clearer<br/>view of your pipeline.</h2></div><button onClick={()=>navigate('/login')}>Sign in to TeleCRM <ArrowUpRight size={18}/></button></section><Footer/>
  </main>;
};
export default LandingPage;
