import React from 'react'
import {
  LayoutDashboard, ClipboardCheck, Building2, Users, Settings,
  Search, Plus, Filter, FileDown, ChevronRight, MoreVertical,
  Mail, Lock, MapPin, Calendar, Layers
} from 'lucide-react'

const PROPERTIES = [
  { id: 1, name: 'Résidence Les Lilas', type: 'Immeuble', address: '12 Rue des Fleurs, Paris', units: 24, lastMission: '12/03/2024' },
  { id: 2, name: 'Pavillon Horizon', type: 'Maison', address: '45 Avenue Foch, Lyon', units: 1, lastMission: '05/04/2024' },
  { id: 3, name: 'Centre Affaires Étoile', type: 'Commercial', address: '8 bis Quai de la Rapée, Bordeaux', units: 12, lastMission: '28/02/2024' },
  { id: 4, name: 'Le Grand Parc', type: 'Immeuble', address: '102 Bd Haussmann, Paris', units: 56, lastMission: '15/05/2024' },
  { id: 5, name: 'Villa Serena', type: 'Maison', address: '7 Impasse des Pins, Nice', units: 1, lastMission: '10/01/2024' },
  { id: 6, name: 'Espace Innovation', type: 'Commercial', address: '22 Rue de la Soie, Nantes', units: 8, lastMission: '20/04/2024' },
]

const NavItem = ({ icon: Icon, label, active = false }: { icon: React.ElementType, label: string, active?: boolean }) => (
  <div className={`group flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200 border-l-[3px] ${active ? 'bg-[#eff6ff] text-[#2563eb] border-[#2563eb]' : 'text-[#64748b] border-transparent hover:bg-slate-50 hover:text-slate-900'}`}>
    <Icon className={`w-4 h-4 mr-3 ${active ? 'text-[#2563eb]' : 'text-[#94a3b8] group-hover:text-slate-600'}`} />
    <span className="font-medium text-[14px] tracking-tight">{label}</span>
  </div>
)

const TypeBadge = ({ type }: { type: string }) => {
  const s: Record<string, string> = { 'Immeuble': 'bg-blue-50 text-blue-600 border-blue-100', 'Maison': 'bg-green-50 text-green-600 border-green-100', 'Commercial': 'bg-amber-50 text-amber-600 border-amber-100' }
  return <span className={`px-2 py-0.5 rounded-full text-[12px] font-medium border ${s[type] || 'bg-slate-50 text-slate-600'}`}>{type}</span>
}

export default function VibesSelection() {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-[1400px] mx-auto space-y-8">
        <div className="text-center space-y-3 pt-4 pb-4">
          <h1 className="text-3xl font-bold text-white">Option A — Minimal Pro</h1>
          <p className="text-gray-400">Inspiré de la présentation ImmoChecker V2. Clash Display + Satoshi, bleu #2563eb, cards blanches, sidebar propre.</p>
          <p className="text-gray-500 text-sm">Si ce design vous plaît, dites "applique ce design" pour l'appliquer à toute l'app.</p>
        </div>
        <div className="rounded-2xl overflow-hidden ring-1 ring-gray-700 shadow-2xl">
          <div className="flex min-h-[800px] bg-[#f1f5f9] text-slate-900" style={{ fontFamily: "'Satoshi', sans-serif" }}>
            <style dangerouslySetInnerHTML={{ __html: `@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,600,700&f[]=satoshi@400,500,700&display=swap'); .font-clash { font-family: 'Clash Display', sans-serif; }` }} />
            {/* SIDEBAR */}
            <aside className="w-[260px] bg-white border-r border-[#e2e8f0] flex flex-col shrink-0">
              <div className="p-6 flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20"><Building2 className="text-white w-5 h-5" /></div>
                <h1 className="text-[19px] font-clash font-bold tracking-tight">Immo<span className="text-[#2563eb]">Checker</span></h1>
              </div>
              <nav className="flex-1 overflow-y-auto pt-4">
                <div className="mb-6"><p className="px-6 mb-2 text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">Opérationnel</p><NavItem icon={LayoutDashboard} label="Tableau de bord" /><NavItem icon={ClipboardCheck} label="Missions" /></div>
                <div className="mb-6"><p className="px-6 mb-2 text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">Référentiel</p><NavItem icon={Building2} label="Parc immobilier" active /><NavItem icon={Users} label="Tiers" /></div>
                <div className="mb-6"><p className="px-6 mb-2 text-[11px] font-bold tracking-wider text-[#94a3b8] uppercase">Administration</p><NavItem icon={Settings} label="Paramètres" /></div>
              </nav>
              <div className="p-4 border-t border-[#e2e8f0]">
                <div className="flex items-center p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">JD</div>
                  <div className="ml-3"><p className="text-[14px] font-bold text-slate-900">Julien Dupont</p><p className="text-[12px] text-[#64748b]">Admin · FlatChecker</p></div>
                </div>
              </div>
            </aside>
            {/* MAIN */}
            <main className="flex-1 p-8 overflow-y-auto">
              <div className="flex items-center space-x-2 text-[13px] text-[#64748b] mb-4 font-medium"><span>Référentiel</span><ChevronRight className="w-3 h-3" /><span className="text-slate-900">Parc immobilier</span></div>
              <div className="flex justify-between items-end mb-8">
                <h2 className="text-[28px] font-clash font-bold tracking-[-0.5px] text-slate-900">Parc immobilier</h2>
                <div className="flex space-x-3">
                  <button className="flex items-center px-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-[14px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm"><FileDown className="w-4 h-4 mr-2" />Importer CSV</button>
                  <button className="flex items-center px-4 py-2 bg-[#2563eb] text-white rounded-lg text-[14px] font-bold hover:bg-[#1d4ed8] shadow-lg shadow-blue-500/15"><Plus className="w-4 h-4 mr-2" />Nouveau lot</button>
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input placeholder="Rechercher un bâtiment, une adresse..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563eb]" /></div>
                <button className="flex items-center px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-lg text-[14px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm"><Filter className="w-4 h-4 mr-2" />Filtres</button>
              </div>
              {/* TABLE */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <table className="w-full border-collapse text-left"><thead><tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Désignation</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Adresse</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] text-center">Lots</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Dernière mission</th>
                  <th className="px-6 py-4"></th>
                </tr></thead><tbody>{PROPERTIES.map(p => (
                  <tr key={p.id} className="border-b border-[#f1f5f9] hover:bg-[#eff6ff]/30 transition-colors group">
                    <td className="px-6 py-4"><span className="font-bold text-[14px] text-slate-900 group-hover:text-[#2563eb] transition-colors cursor-pointer">{p.name}</span></td>
                    <td className="px-6 py-4"><TypeBadge type={p.type} /></td>
                    <td className="px-6 py-4 text-[14px] text-slate-500 truncate max-w-[200px]">{p.address}</td>
                    <td className="px-6 py-4 text-center"><span className="inline-flex items-center justify-center w-8 h-6 bg-slate-100 rounded-md text-[12px] font-bold text-slate-600">{p.units}</span></td>
                    <td className="px-6 py-4 text-[14px] text-slate-600">{p.lastMission}</td>
                    <td className="px-6 py-4 text-right"><button className="p-1 hover:bg-slate-100 rounded text-slate-400"><MoreVertical className="w-4 h-4" /></button></td>
                  </tr>
                ))}</tbody></table>
                <div className="px-6 py-4 flex items-center justify-between border-t border-[#f1f5f9]"><span className="text-[13px] text-[#94a3b8]">1–6 sur 42 bâtiments</span><div className="flex space-x-1"><button disabled className="px-3 py-1 bg-white border border-[#e2e8f0] rounded text-[13px] text-slate-400">Précédent</button><button className="px-3 py-1 bg-[#2563eb] border border-[#2563eb] rounded text-[13px] text-white font-bold">1</button><button className="px-3 py-1 bg-white border border-[#e2e8f0] rounded text-[13px] text-slate-600 hover:bg-slate-50">2</button><button className="px-3 py-1 bg-white border border-[#e2e8f0] rounded text-[13px] text-slate-600 hover:bg-slate-50">Suivant</button></div></div>
              </div>
              {/* PREVIEWS */}
              <div className="mt-12 grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Aperçu — Fiche Bâtiment</p>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.06]"><Building2 className="w-24 h-24" /></div>
                    <div className="flex justify-between items-start mb-6"><div><h3 className="text-[24px] font-clash font-bold text-slate-900 tracking-tight">Résidence Les Lilas</h3><div className="flex items-center text-slate-400 text-[13px] mt-1"><MapPin className="w-3 h-3 mr-1" /> Paris 15ème</div></div><button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-[13px] font-bold shadow-lg shadow-blue-500/20">+ Ajouter un lot</button></div>
                    <div className="grid grid-cols-2 gap-4">{[{ label: 'Année construction', value: '1984', icon: Calendar }, { label: 'Nombre de lots', value: '24 unités', icon: Layers }, { label: 'Surface totale', value: '1 240 m²', icon: LayoutDashboard }, { label: 'Dernier audit', value: 'Mars 2024', icon: ClipboardCheck }].map((info, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start space-x-3"><info.icon className="w-4 h-4 text-slate-400 mt-0.5" /><div><p className="text-[11px] text-[#94a3b8] font-bold uppercase">{info.label}</p><p className="text-[14px] font-bold text-slate-700">{info.value}</p></div></div>
                    ))}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-widest">Aperçu — Connexion</p>
                  <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-2xl p-8 max-w-sm mx-auto">
                    <div className="text-center mb-8"><div className="w-12 h-12 bg-[#2563eb] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-4"><Building2 className="text-white w-7 h-7" /></div><h3 className="text-[20px] font-clash font-bold text-slate-900">ImmoChecker</h3><p className="text-[14px] text-slate-500 mt-1">Gestion d'états des lieux simplifiée</p></div>
                    <div className="space-y-4">
                      <div><label className="block text-[12px] font-bold text-slate-700 mb-1.5 uppercase">Adresse email</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input placeholder="julien@immogroup.fr" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px]" /></div></div>
                      <div><div className="flex justify-between items-center mb-1.5"><label className="text-[12px] font-bold text-slate-700 uppercase">Mot de passe</label><a href="#" className="text-[11px] font-bold text-[#2563eb]">Oublié ?</a></div><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[14px]" /></div></div>
                      <button className="w-full py-2.5 bg-[#2563eb] text-white rounded-lg text-[14px] font-bold shadow-lg shadow-blue-500/20">Se connecter</button>
                      <p className="text-center text-[13px] text-slate-500 pt-2">Pas de compte ? <a href="#" className="text-[#2563eb] font-bold">Créer un compte</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
