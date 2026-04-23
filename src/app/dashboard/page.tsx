import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  ShieldCheck, 
  Activity,
  Calendar,
  User,
  Brain
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header with Stats */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Health Ecosystem</h1>
          <p className="text-zinc-400">Welcome back. Your clinical intelligence is synced and secured.</p>
        </div>
        <Link href="/dashboard/reports/upload">
          <button className="inline-flex h-12 items-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={18} />
            Integrate New Data
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Clinical Reports" 
          value="12" 
          change="+2" 
          trend="up" 
          icon={<FileText className="text-blue-500" size={20} />} 
        />
        <StatsCard 
          title="Active Consents" 
          value="04" 
          change="3 expiring" 
          trend="down" 
          icon={<ShieldCheck className="text-emerald-500" size={20} />} 
        />
        <StatsCard 
          title="Data Integrity" 
          value="99%" 
          change="Synced" 
          trend="up" 
          icon={<Activity className="text-indigo-500" size={20} />} 
        />
        <StatsCard 
          title="Shared Nodes" 
          value="03" 
          change="Active" 
          trend="neutral" 
          icon={<User className="text-orange-500" size={20} />} 
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Reports List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Recent Intelligence</h2>
            <Link href="/dashboard/reports" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors">Explorer all</Link>
          </div>
          <div className="glass-card rounded-[32px] overflow-hidden border border-white/5">
            <div className="divide-y divide-white/5 font-medium">
              <ReportItem 
                title="Neurological Assessment" 
                date="Oct 12, 2024" 
                provider="Dr. Sarah Johnson" 
                status="Analyzed"
              />
              <ReportItem 
                title="Cardiovascular Panel" 
                date="Sep 28, 2024" 
                provider="City Labs Clinic" 
                status="Analyzed"
              />
              <ReportItem 
                title="Radiology - Chest" 
                date="Sep 15, 2024" 
                provider="General Hospital" 
                status="In Review"
              />
              <ReportItem 
                title="Metabolic Screening" 
                date="Aug 10, 2024" 
                provider="Smile Dental" 
                status="Analyzed"
              />
            </div>
          </div>
        </div>

        {/* Health Insights */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Neural Insights</h2>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                  <Brain size={20} />
                </div>
                <span className="font-bold tracking-tight">AI Wellness Signal</span>
              </div>
              <p className="text-blue-50/80 text-sm leading-relaxed mb-8">
                Neural analysis of your last 3 tests indicates a 12% optimization in cholesterol levels. Your current protocol is yielding high results.
              </p>
              <button className="w-full rounded-2xl bg-white py-3.5 text-xs font-bold text-blue-950 transition-all hover:bg-blue-50 hover:scale-[1.02]">
                Decrypt Explanation (XAI)
              </button>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
              <Activity size={180} />
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6 border border-white/5">
            <h3 className="font-bold text-white mb-6 flex items-center gap-3">
              <Calendar size={18} className="text-zinc-500" />
              Pulse: Pending Access
            </h3>
            <div className="space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-medium tracking-tight">Dr. Aris (Cardiology)</span>
                <span className="text-emerald-500 font-bold">Tomorrow</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-medium tracking-tight">Mayo Clinic Access</span>
                <span className="text-zinc-500 font-bold">Oct 25, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral', icon: React.ReactNode }) {
  return (
    <div className="glass-card rounded-[32px] p-7 border border-white/5 group hover:border-white/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-bold leading-none ${
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-zinc-500'
        }`}>
          {trend === 'up' && <ArrowUpRight size={14} />}
          {trend === 'down' && <ArrowDownRight size={14} />}
          {change}
        </div>
      </div>
      <h3 className="text-zinc-500 text-sm font-semibold tracking-tight">{title}</h3>
      <div className="mt-2 text-3xl font-bold text-white tracking-tighter">{value}</div>
    </div>
  );
}

function ReportItem({ title, date, provider, status }: { title: string, date: string, provider: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <div className="flex items-center gap-5">
        <div className="p-3 bg-white/5 text-zinc-400 rounded-2xl group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all duration-300">
          <FileText size={22} />
        </div>
        <div>
          <h4 className="font-bold text-white text-[15px] group-hover:text-blue-400 transition-colors">{title}</h4>
          <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1.5 font-medium">
            <span className="flex items-center gap-1.5"><Calendar size={13} className="text-zinc-600" /> {date}</span>
            <span className="flex items-center gap-1.5"><User size={13} className="text-zinc-600" /> {provider}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
          status === 'Analyzed' 
            ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' 
            : 'bg-orange-500/5 border-orange-500/10 text-orange-500'
        }`}>
          {status}
        </span>
        <ArrowUpRight size={20} className="text-zinc-700 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
    </div>
  );
}
