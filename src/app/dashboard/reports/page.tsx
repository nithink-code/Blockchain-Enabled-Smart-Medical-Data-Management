import { FileText, Search, Filter, ArrowUpRight, Calendar, User, Download, MoreVertical } from "lucide-react";
import Link from "next/link";

const REPORTS = [
  { id: 1, title: "Annual Physical Examination", date: "Oct 12, 2024", provider: "Dr. Sarah Johnson", status: "Analyzed", type: "General" },
  { id: 2, title: "Blood Work - Lipid Panel", date: "Sep 28, 2024", provider: "City Labs Clinic", status: "Analyzed", type: "Laboratory" },
  { id: 3, title: "Chest X-Ray Results", date: "Sep 15, 2024", provider: "General Hospital", status: "Pending Verification", type: "Radiology" },
  { id: 4, title: "Dental Checkup", date: "Aug 10, 2024", provider: "Smile Dental", status: "Analyzed", type: "Dental" },
  { id: 5, title: "Eye Examination", date: "Jul 22, 2024", provider: "Vision Plus", status: "Analyzed", type: "Optometry" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Record Repository</h1>
          <p className="text-zinc-400">Manage and explore your historical clinical data through a secure viewport.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex h-12 items-center gap-2 px-5 border border-white/5 bg-white/5 rounded-2xl text-sm font-bold text-zinc-300 hover:bg-white/10 hover:text-white transition-all">
            <Filter size={18} />
            Filter View
          </button>
          <Link href="/dashboard/reports/upload">
            <button className="flex h-12 items-center gap-2 px-6 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all">
              Add New Record
            </button>
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                <th className="px-8 py-5">Intel Descriptor</th>
                <th className="px-8 py-5">Classification</th>
                <th className="px-8 py-5">Source Node</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">State</th>
                <th className="px-8 py-5 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/5 text-zinc-400 rounded-xl group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                        <FileText size={20} />
                      </div>
                      <span className="font-bold text-white text-[15px] group-hover:text-blue-400 transition-colors">{report.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-zinc-400 font-semibold tracking-tight">{report.type}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <User size={14} className="text-zinc-600" />
                      <span className="text-xs text-zinc-300 font-medium">{report.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={14} className="text-zinc-600" />
                      <span className="text-xs text-zinc-300 font-medium">{report.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border ${
                      report.status === 'Analyzed' 
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' 
                        : 'bg-orange-500/5 border-orange-500/10 text-orange-500'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-zinc-400 hover:text-blue-400 transition-colors">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
