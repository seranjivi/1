import { useState } from "react";

// ══════════════════════════════════════════════════════════════════
// MASKING UTILITIE
// ══════════════════════════════════════════════════════════════════
const maskContractNumber = (contractNo) => {
  const parts = contractNo.split('/');
  if (parts.length >= 4) {
    return `${parts[0]}/${parts[1]}/${parts[2]}/XXXX`;
  }
  return contractNo.replace(/\/([^\/]+)$/, '/XXXX');
};

const maskCustomerName = (name) => {
  if (!name) return name;
  const words = name.trim().split(' ');
  return words.map(word => {
    if (word.length === 0) return word;
    return word[0] + '*'.repeat(word.length - 1);
  }).join(' ');
};

const maskDOB = (dob) => {
  if (!dob) return dob;
  const parts = dob.split('-');
  if (parts.length === 3) {
    return `XX-XX-${parts[2]}`;
  }
  return dob;
};

const maskPhoneNumber = (phone) => {
  if (!phone || phone.length < 4) return phone;
  const firstTwo = phone.substring(0, 2);
  const lastTwo = phone.substring(phone.length - 2);
  const middleStars = '*'.repeat(phone.length - 4);
  return firstTwo + middleStars + lastTwo;
};

// ══════════════════════════════════════════════════════════════════
// SHARED DATA
// ══════════════════════════════════════════════════════════════════
const rules = [
  { id: 3,  desc: "Flag validation – LY T/Z/G flag vs CY status" },
  { id: 11, desc: "R flag DPD >0, OD>0, for all POS>0" },
  { id: 17, desc: "First after contract date EMI Date should be valid" },
  { id: 25, desc: "POS>Finance amount for Contract more than 1 year old, must be in NPA" },
  { id: 26, desc: "Default date and NPA date to be mapped contract wise" },
  { id: 27, desc: "NPA customer new business after default date" },
  { id: 30, desc: "Last EMI date should align with contract date" },
  { id: 31, desc: "Duplicate contract number across multiple loan register with different flag" },
];

const deviations = [
  { id: "DV-10234", contractNo: "HFL/VHL/2023/00782", contractDate: "12-Mar-2022", product: "Vehicle Loan",       financeAmt: "4,80,000",  emi: "11,240", flag: "T", dpd: 87,  pos: "3,21,450",  od: "3,45,000",  ruleId: 11, status: "Pending Review", reviewer: "Priya Menon", branch: "Chennai - Central", correctionMethod: "Data Correction", customerName: "Rajesh Kumar", dob: "15-08-1985", phone: "9876543210" },
  { id: "DV-10235", contractNo: "HFL/CVL/2023/00341", contractDate: "05-Jun-2022", product: "Commercial Vehicle", financeAmt: "12,50,000", emi: "28,400", flag: "G", dpd: 0,   pos: "9,87,200",  od: "9,87,200",  ruleId: 3,  status: "Under Review",   reviewer: "Arjun Rajan",  branch: "Coimbatore",       correctionMethod: "Accept Deviation", customerName: "Meena Rani", dob: "22-12-1978", phone: "9123456789" },
  { id: "DV-10236", contractNo: "HFL/TL/2022/01120",  contractDate: "19-Nov-2021", product: "Tractor Loan",       financeAmt: "7,20,000",  emi: "16,800", flag: "Z", dpd: 0,   pos: "2,14,000",  od: "0",         ruleId: 25, status: "Reviewed",        reviewer: "Kavitha S",    branch: "Madurai",          correctionMethod: "Data Correction", customerName: "Mohan Reddy", dob: "10-03-1992", phone: "8765432109" },
  { id: "DV-10237", contractNo: "HFL/VHL/2022/00998", contractDate: "01-Aug-2022", product: "Vehicle Loan",       financeAmt: "3,60,000",  emi: "9,100",  flag: "R", dpd: 142, pos: "2,98,000",  od: "3,10,000",  ruleId: 11, status: "Escalated",       reviewer: "Suresh K",     branch: "Tiruppur",         correctionMethod: "Pending", customerName: "Anita Sharma", dob: "05-06-1988", phone: "7654321098" },
  { id: "DV-10238", contractNo: "HFL/CVL/2021/00567", contractDate: "14-Feb-2021", product: "Commercial Vehicle", financeAmt: "22,00,000", emi: "51,200", flag: "G", dpd: 0,   pos: "15,40,000", od: "15,40,000", ruleId: 26, status: "Pending Review", reviewer: "Nirmala T",    branch: "Chennai - North",  correctionMethod: "Accept Deviation", customerName: "Venkatesh Iyer", dob: "18-09-1975", phone: "9876543210" },
  { id: "DV-10239", contractNo: "HFL/TL/2023/00204",  contractDate: "30-Sep-2022", product: "Tractor Loan",       financeAmt: "5,80,000",  emi: "13,500", flag: "T", dpd: 0,   pos: "4,20,000",  od: "0",         ruleId: 30, status: "Pending Review", reviewer: "Mohan R",      branch: "Salem",            correctionMethod: "Data Correction", customerName: "Lakshmi Narayanan", dob: "25-11-1980", phone: "8901234567" },
  { id: "DV-10240", contractNo: "HFL/VHL/2022/01455", contractDate: "22-Jan-2022", product: "Vehicle Loan",       financeAmt: "6,10,000",  emi: "14,800", flag: "R", dpd: 210, pos: "4,55,000",  od: "4,78,000",  ruleId: 27, status: "Reviewed",        reviewer: "Deepa V",      branch: "Trichy",           correctionMethod: "Data Correction", customerName: "Priya Natarajan", dob: "08-02-1995", phone: "7890123456" },
  { id: "DV-10241", contractNo: "HFL/CVL/2022/00890", contractDate: "07-May-2022", product: "Commercial Vehicle", financeAmt: "18,50,000", emi: "43,100", flag: "T", dpd: 0,   pos: "11,20,000", od: "11,20,000", ruleId: 31, status: "Pending Review", reviewer: "Priya Menon",  branch: "Chennai - Central", correctionMethod: "Pending", customerName: "Karthik Subramanian", dob: "14-07-1987", phone: "6789012345" },
];

const pendingApprovals = [
  { id: "DV-10234", contractNo: "HFL/VHL/2023/00782", contractDate: "12-Mar-2022", product: "Vehicle Loan",       branch: "Chennai - Central", ruleId: 11, ruleDesc: "R flag DPD >0, OD>0, for all POS>0",                          financeAmt: "4,80,000",  emi: "11,240", originalData: { flag:"T", dpd:"87",  pos:"3,21,450",  od:"3,45,000",  correctionMethod:"Data Correction"   }, updatedData: { flag:"R", dpd:"87",  pos:"3,21,450",  od:"3,21,450",  correctionMethod:"Data Correction"      }, reviewer:"Priya Menon", reviewedOn:"14 Jan 2025, 04:22 PM", reviewNote:"OD was incorrectly mapped to exceed POS. Source CBS data confirms OD should match POS at 3,21,450. Flag corrected from T to R based on DPD of 87 days.", submittedOn:"14 Jan 2025, 04:30 PM", priority:"High", customerName: "Rajesh Kumar", dob: "15-08-1985", phone: "9876543210" },
  { id: "DV-10238", contractNo: "HFL/CVL/2021/00567", contractDate: "14-Feb-2021", product: "Commercial Vehicle", branch: "Chennai - North",  ruleId: 26, ruleDesc: "Default date and NPA date to be mapped contract wise",         financeAmt: "22,00,000", emi: "51,200", originalData: { flag:"G", dpd:"0",   pos:"15,40,000", od:"15,40,000", correctionMethod:"Accept Deviation"  }, updatedData: { flag:"G", dpd:"0",   pos:"15,40,000", od:"15,40,000", correctionMethod:"Accept Deviation"     }, reviewer:"Nirmala T",    reviewedOn:"15 Jan 2025, 11:10 AM", reviewNote:"Default date and NPA date are aligned per RBI norms. No correction needed. Deviation acceptable under OTR scheme.", submittedOn:"15 Jan 2025, 11:20 AM", priority:"Medium", customerName: "Venkatesh Iyer", dob: "18-09-1975", phone: "9876543210" },
  { id: "DV-10241", contractNo: "HFL/CVL/2022/00890", contractDate: "07-May-2022", product: "Commercial Vehicle", branch: "Chennai - Central", ruleId: 31, ruleDesc: "Duplicate contract number across multiple loan register", financeAmt: "18,50,000", emi: "43,100", originalData: { flag:"T", dpd:"0",   pos:"11,20,000", od:"11,20,000", correctionMethod:"Pending"           }, updatedData: { flag:"T", dpd:"0",   pos:"11,20,000", od:"11,20,000", correctionMethod:"Escalate to Head Office" }, reviewer:"Priya Menon",  reviewedOn:"16 Jan 2025, 02:45 PM", reviewNote:"Duplicate contract found in both Vehicle LR and CVL LR with different flags. Unable to resolve at branch level. Escalating to Head Office.", submittedOn:"16 Jan 2025, 02:55 PM", priority:"High", customerName: "Karthik Subramanian", dob: "14-07-1987", phone: "6789012345" },
];

const historyData = [
  { id:"DV-10230", contractNo:"HFL/TL/2022/01120",  product:"Tractor Loan",       ruleId:25, branch:"Madurai",          reviewer:"Kavitha S",    approver:"Ramesh Chandran", action:"Approved",  actionDate:"10 Jan 2025, 03:15 PM", approverNote:"Correction validated against source data. Approved.", priority:"Medium", customerName: "Mohan Reddy", dob: "10-03-1992", phone: "8765432109" },
  { id:"DV-10231", contractNo:"HFL/VHL/2022/01455", product:"Vehicle Loan",       ruleId:27, branch:"Trichy",           reviewer:"Deepa V",      approver:"Ramesh Chandran", action:"Approved",  actionDate:"11 Jan 2025, 10:40 AM", approverNote:"NPA date mapping verified with CBS. Approved.", priority:"High", customerName: "Priya Natarajan", dob: "08-02-1995", phone: "7890123456" },
  { id:"DV-10232", contractNo:"HFL/CVL/2023/00341", product:"Commercial Vehicle", ruleId:3,  branch:"Coimbatore",       reviewer:"Arjun Rajan",  approver:"Ramesh Chandran", action:"Rejected",  actionDate:"12 Jan 2025, 09:05 AM", approverNote:"Insufficient justification for accepting deviation. Returned to reviewer for re-evaluation.", priority:"Low", customerName: "Meena Rani", dob: "22-12-1978", phone: "9123456789" },
  { id:"DV-10233", contractNo:"HFL/VHL/2022/00998", product:"Vehicle Loan",       ruleId:11, branch:"Tiruppur",         reviewer:"Suresh K",     approver:"Ramesh Chandran", action:"Sent Back", actionDate:"13 Jan 2025, 04:58 PM", approverNote:"DPD value mismatch with CBS. Reviewer to recheck and resubmit.", priority:"High", customerName: "Anita Sharma", dob: "05-06-1988", phone: "7654321098" },
  { id:"DV-10228", contractNo:"HFL/TL/2023/00204",  product:"Tractor Loan",       ruleId:30, branch:"Salem",            reviewer:"Mohan R",      approver:"Ramesh Chandran", action:"Approved",  actionDate:"08 Jan 2025, 01:20 PM", approverNote:"Last EMI date corrected to align with contract. Approved.", priority:"Low", customerName: "Lakshmi Narayanan", dob: "25-11-1980", phone: "8901234567" },
  { id:"DV-10227", contractNo:"HFL/CVL/2022/00445", product:"Commercial Vehicle", ruleId:17, branch:"Chennai - North",  reviewer:"Nirmala T",    approver:"Ramesh Chandran", action:"Approved",  actionDate:"07 Jan 2025, 11:55 AM", approverNote:"First EMI date validated. Deviation acceptable. Approved.", priority:"Medium", customerName: "Unknown", dob: "01-01-1980", phone: "1234567890" },
  { id:"DV-10225", contractNo:"HFL/VHL/2021/00312", product:"Vehicle Loan",       ruleId:26, branch:"Chennai - Central",reviewer:"Priya Menon",  approver:"Ramesh Chandran", action:"Rejected",  actionDate:"06 Jan 2025, 03:30 PM", approverNote:"Default date not updated in source system. Cannot approve. Escalate to IT.", priority:"High", customerName: "Unknown", dob: "01-01-1980", phone: "1234567890" },
];

// ══════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════════
const statusColors = {
  "Pending Review": { bg:"#FFF3CD", text:"#856404", dot:"#F0AD4E" },
  "Under Review":   { bg:"#CCE5FF", text:"#004085", dot:"#3A86FF" },
  "Reviewed":       { bg:"#D4EDDA", text:"#155724", dot:"#28A745" },
  "Escalated":      { bg:"#F8D7DA", text:"#721C24", dot:"#DC3545" },
};

const StatusBadge = ({ status }) => {
  const c = statusColors[status] || statusColors["Pending Review"];
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, background:c.bg, color:c.text, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600 }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:c.dot, display:"inline-block" }} />{status}
    </span>
  );
};

const PriorityBadge = ({ p }) => {
  const c = { High:["#FEE2E2","#991B1B","#EF4444"], Medium:["#FEF9C3","#713F12","#EAB308"], Low:["#DCFCE7","#14532D","#22C55E"] }[p] || ["#F1F5F9","#475569","#94A3B8"];
  return <span style={{ background:c[0], color:c[1], fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:5 }}><span style={{ width:6, height:6, borderRadius:"50%", background:c[2], display:"inline-block" }} />{p}</span>;
};

const ActionBadge = ({ a }) => {
  const c = { Approved:["#D1FAE5","#065F46","#10B981"], Rejected:["#FEE2E2","#991B1B","#EF4444"], "Sent Back":["#FEF3C7","#78350F","#F59E0B"] }[a] || ["#F1F5F9","#475569","#94A3B8"];
  return <span style={{ background:c[0], color:c[1], fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, display:"inline-flex", alignItems:"center", gap:6 }}><span style={{ width:7, height:7, borderRadius:"50%", background:c[2] }} />{a}</span>;
};

// ══════════════════════════════════════════════════════════════════
// GLOBAL NAV
// ══════════════════════════════════════════════════════════════════
const ROLES = {
  reviewer: { name:"Priya Menon",     role:"Reviewer",      unit:"Chennai - Central", initial:"P", tabs:[{ id:"dashboard", label:"🏠 Dashboard" },{ id:"rules", label:"📖 Rules Master" },{ id:"list", label:"📋 Deviation List" },{ id:"ruleview", label:"🔎 Rule-wise View" },{ id:"detail", label:"🔍 Review Detail" }] },
  head:     { name:"Ramesh Chandran", role:"Org Unit Head", unit:"Chennai Region",    initial:"R", tabs:[{ id:"dashboard", label:"🏠 Dashboard" },{ id:"rules", label:"📖 Rules Master" },{ id:"approval",label:"⏳ Pending Approvals" },{ id:"history",label:"🕑 Approval History" }] },
  admin:    { name:"Suresh Iyer",     role:"Admin",         unit:"Head Office",       initial:"S", tabs:[{ id:"rules", label:"📖 Rules Master" },{ id:"permconfig", label:"🔐 Org & Permissions" },{ id:"usermgmt", label:"👥 User Management" },{ id:"audittrail", label:"🗒 Audit Trail" }] },
};

function GlobalNav({ activeRole, setActiveRole, activePage, setActivePage, selectedDeviation }) {
  const roleInfo = ROLES[activeRole];
  return (
    <div style={{ background:"#0A2342", borderBottom:"1px solid #1E3A5F", position:"sticky", top:0, zIndex:100 }}>
      {/* Top bar */}
      <div style={{ padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#1D4ED8,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(29,78,216,0.4)" }}>
            <span style={{ color:"#fff", fontWeight:900, fontSize:13 }}>HFL</span>
          </div>
          <div>
            <div style={{ color:"#fff", fontWeight:700, fontSize:14 }}>RBI Compliance Portal</div>
            <div style={{ color:"#475569", fontSize:11 }}>Hinduja Leyland Finance · FY 2024–25</div>
          </div>
          <span style={{ background:"#1E3A5F", color:"#7EB8F7", fontSize:10, padding:"2px 8px", borderRadius:4, fontWeight:700, marginLeft:4, letterSpacing:0.5 }}>PRESALES DEMO</span>
        </div>

        {/* Role switcher */}
        <div style={{ display:"flex", background:"#0F1C2E", borderRadius:10, padding:4, gap:4, border:"1px solid #1E3A5F" }}>
          {Object.entries(ROLES).map(([key, r]) => (
            <button key={key} onClick={() => { setActiveRole(key); setActivePage(r.tabs[0].id); }}
              style={{ padding:"6px 16px", borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12, fontWeight:700, transition:"all 0.15s",
                background: activeRole === key ? "linear-gradient(135deg,#1D4ED8,#2563EB)" : "transparent",
                color: activeRole === key ? "#fff" : "#475569",
                boxShadow: activeRole === key ? "0 2px 8px rgba(29,78,216,0.4)" : "none" }}>
              {key === "reviewer" ? "👤 Maker" : key === "head" ? "🏛 Checker" : "⚙️ Admin"}
            </button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"#E2E8F0", fontSize:13, fontWeight:700 }}>{roleInfo.name}</div>
            <div style={{ color:"#3B82F6", fontSize:11, fontWeight:600 }}>{roleInfo.role} · {roleInfo.unit}</div>
          </div>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#1D4ED8,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:14 }}>{roleInfo.initial}</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ padding:"0 28px", display:"flex", gap:4, borderTop:"1px solid #1E3A5F" }}>
        {roleInfo.tabs.map(tab => {
          const isDisabled = (tab.id === "detail" || tab.id === "ruleview") && !selectedDeviation;
          return (
            <button key={tab.id}
              onClick={() => !isDisabled && setActivePage(tab.id)}
              style={{ padding:"10px 18px", border:"none", background:"transparent", cursor: isDisabled ? "not-allowed" : "pointer",
                fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:600, opacity: isDisabled ? 0.35 : 1,
                color: activePage === tab.id ? "#60A5FA" : "#475569",
                borderBottom: activePage === tab.id ? "2px solid #3B82F6" : "2px solid transparent",
                marginBottom:-1, transition:"all 0.15s" }}>
              {tab.label}{(tab.id === "detail" || tab.id === "ruleview") && !selectedDeviation ? " (select a row first)" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 1 — DEVIATION LIST VIEW
// ══════════════════════════════════════════════════════════════════
function DeviationListView({ onSelectDeviation }) {
  const [search, setSearch] = useState("");
  const [filterRule, setFilterRule] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = deviations.filter(d => {
    const ms = d.contractNo.toLowerCase().includes(search.toLowerCase()) || d.product.toLowerCase().includes(search.toLowerCase()) || d.branch.toLowerCase().includes(search.toLowerCase());
    const mr = filterRule === "All" || d.ruleId === parseInt(filterRule);
    const mst = filterStatus === "All" || d.status === filterStatus;
    return ms && mr && mst;
  });

  const counts = { total: deviations.length, pending: deviations.filter(d=>d.status==="Pending Review").length, reviewed: deviations.filter(d=>d.status==="Reviewed").length, escalated: deviations.filter(d=>d.status==="Escalated").length };

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>Contract Deviation List</h1>
        <p style={{ margin:"4px 0 0", color:"#64748B", fontSize:13 }}>Review and validate RBI compliance deviations flagged across loan contracts in your org unit.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Deviations", value:counts.total,     color:"#0A2342", bg:"#fff",    accent:"#2563EB" },
          { label:"Pending Review",   value:counts.pending,   color:"#856404", bg:"#FFFBEB", accent:"#F0AD4E" },
          { label:"Reviewed",         value:counts.reviewed,  color:"#155724", bg:"#F0FDF4", accent:"#28A745" },
          { label:"Escalated",        value:counts.escalated, color:"#721C24", bg:"#FFF5F5", accent:"#DC3545" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{c.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:12, padding:"14px 20px", marginBottom:16, display:"flex", gap:16, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contract, product, branch..."
            style={{ width:"100%", padding:"9px 12px 9px 36px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Rule:</span>
          <select value={filterRule} onChange={e=>setFilterRule(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            <option value="All">All Rules</option>
            {rules.map(r=><option key={r.id} value={r.id}>Rule {r.id}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Status:</span>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            <option value="All">All Status</option>
            {Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ color:"#64748B", fontSize:13 }}>{filtered.length} records</span>
      </div>

      <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
              {["Deviation ID","Contract No.","Customer Name","Product","Branch","Rule","DPD","POS (₹)","OD (₹)","Status","Correction","Action"].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d,i)=>(
              <tr key={d.id} style={{ borderBottom:"1px solid #F1F5F9", background: i%2===0?"#fff":"#FAFBFC", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"}>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#2563EB", fontWeight:700 }}>{d.id}</td>
                <td style={{ padding:"13px 14px", fontSize:11, color:"#0A2342", fontWeight:600, fontFamily:"monospace" }}>{maskContractNumber(d.contractNo)}</td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#334155" }}>{maskCustomerName(d.customerName)}</td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#334155" }}>{d.product}</td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#334155" }}>{d.branch}</td>
                <td style={{ padding:"13px 14px" }}><span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"3px 8px", borderRadius:6 }}>Rule {d.ruleId}</span></td>
                <td style={{ padding:"13px 14px", fontSize:13, fontWeight:700, color:d.dpd>0?"#DC3545":"#334155" }}>{d.dpd}</td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#334155" }}>₹{d.pos}</td>
                <td style={{ padding:"13px 14px", fontSize:13, color:"#334155" }}>₹{d.od}</td>
                <td style={{ padding:"13px 14px" }}><StatusBadge status={d.status} /></td>
                <td style={{ padding:"13px 14px", fontSize:12, color:"#64748B" }}>{d.correctionMethod}</td>
                <td style={{ padding:"13px 14px" }}>
                  <button onClick={()=>onSelectDeviation(d)}
                    style={{ background:"#0A2342", color:"#fff", border:"none", borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Review →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ padding:48, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No deviations match the current filters.</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 2 — DEVIATION DETAIL / REVIEW
// ══════════════════════════════════════════════════════════════════
function DeviationDetailView({ deviation, onBack }) {
  const rule = rules.find(r=>r.id===deviation.ruleId);
  const [dpd, setDpd] = useState(deviation.dpd.toString());
  const [pos, setPos] = useState(deviation.pos);
  const [od, setOd] = useState(deviation.od);
  const [flag, setFlag] = useState(deviation.flag);
  const [correctionMethod, setCorrectionMethod] = useState(deviation.correctionMethod==="Pending"?"Data Correction":deviation.correctionMethod);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState("review");

  const history = [
    { user:"System",      action:"Deviation flagged by Rule Engine",    time:"12 Jan 2025, 09:14 AM", type:"system" },
    { user:"Priya Menon", action:"Deviation assigned for review",       time:"13 Jan 2025, 10:32 AM", type:"assign" },
    { user:"Priya Menon", action:"Record opened for review",            time:"14 Jan 2025, 02:15 PM", type:"view"   },
  ];

  const handleSubmit = () => { if (!note.trim()) { alert("Please add a review note before submitting."); return; } setSubmitted(true); };
  const fS = { width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, fontFamily:"'DM Sans',sans-serif", color:"#0A2342", boxSizing:"border-box", outline:"none", background:"#fff" };
  const rS = { ...fS, background:"#F8FAFC", color:"#64748B" };

  if (submitted) return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:20, padding:48, textAlign:"center", maxWidth:440, boxShadow:"0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"#D4EDDA", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:32 }}>✓</div>
        <h2 style={{ margin:"0 0 8px", color:"#0A2342", fontSize:22, fontWeight:800 }}>Submitted for Approval</h2>
        <p style={{ color:"#64748B", fontSize:14, margin:"0 0 8px" }}>Deviation <strong>{deviation.id}</strong> has been reviewed and submitted to the Org Unit Head for approval.</p>
        <p style={{ color:"#94A3B8", fontSize:12, margin:"0 0 28px" }}>{maskContractNumber(deviation.contractNo)}</p>
        <button onClick={onBack} style={{ background:"#0A2342", color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Back to List</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"24px 32px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
            <button onClick={onBack} style={{ background:"none", border:"none", color:"#2563EB", fontSize:13, cursor:"pointer", padding:0, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>← Deviation List</button>
            <span style={{ color:"#CBD5E1" }}>›</span>
            <span style={{ color:"#0A2342", fontSize:13, fontWeight:600 }}>{deviation.id}</span>
          </div>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#0A2342" }}>Deviation Detail & Review</h1>
        </div>
        <StatusBadge status={deviation.status} />
      </div>

      <div style={{ background:"#FFF3CD", border:"1px solid #FBBF24", borderRadius:10, padding:"14px 20px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight:700, color:"#78350F", fontSize:14, marginBottom:2 }}>Rule {deviation.ruleId} Deviation Detected</div>
          <div style={{ color:"#92400E", fontSize:13 }}>{rule?.desc}</div>
        </div>
        <span style={{ marginLeft:"auto", background:"#FDE68A", color:"#78350F", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6, whiteSpace:"nowrap" }}>Rule {deviation.ruleId}</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ background:"#0A2342", padding:"13px 20px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:"#7EB8F7", fontSize:16 }}>📄</span>
              <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Contract Information</span>
              <span style={{ marginLeft:"auto", fontFamily:"monospace", color:"#64748B", fontSize:11 }}>{maskContractNumber(deviation.contractNo)}</span>
            </div>
            <div style={{ padding:20, display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
              {[["Deviation ID",deviation.id],["Contract No.",maskContractNumber(deviation.contractNo),true],["Customer Name",maskCustomerName(deviation.customerName)],["Date of Birth",maskDOB(deviation.dob)],["Phone Number",maskPhoneNumber(deviation.phone)],["Contract Date",deviation.contractDate],["Product",deviation.product],["Finance Amount",`₹${deviation.financeAmt}`],["EMI Amount",`₹${deviation.emi}`],["Branch",deviation.branch],["Reviewer",deviation.reviewer],["Correction Method",deviation.correctionMethod]].map(([l,v,m])=>(
                <div key={l}>
                  <div style={{ fontSize:11, color:"#94A3B8", fontWeight:600, textTransform:"uppercase", letterSpacing:0.7, marginBottom:3 }}>{l}</div>
                  <div style={{ fontSize:13, color:"#0A2342", fontWeight:600, fontFamily:m?"monospace":"inherit" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", borderBottom:"2px solid #E2E8F0" }}>
              {[{ id:"review", label:"📝 Review & Edit" },{ id:"history", label:"🕑 Activity History" }].map(tab=>(
                <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ padding:"13px 20px", fontSize:13, fontWeight:700, border:"none", background:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", color:activeTab===tab.id?"#0A2342":"#94A3B8", borderBottom:activeTab===tab.id?"3px solid #2563EB":"3px solid transparent", marginBottom:-2 }}>{tab.label}</button>
              ))}
            </div>

            {activeTab==="review" && (
              <div style={{ padding:22 }}>
                <p style={{ margin:"0 0 18px", color:"#64748B", fontSize:13, background:"#EFF6FF", borderRadius:8, padding:"10px 14px", borderLeft:"3px solid #2563EB" }}>Fields highlighted in blue are editable. All changes will be logged.</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  <div><label style={{ fontSize:12, color:"#64748B", fontWeight:600, display:"block", marginBottom:5 }}>Contract No. (read-only)</label><input style={rS} value={maskContractNumber(deviation.contractNo)} readOnly /></div>
                  <div><label style={{ fontSize:12, color:"#64748B", fontWeight:600, display:"block", marginBottom:5 }}>Contract Date (read-only)</label><input style={rS} value={deviation.contractDate} readOnly /></div>
                  <div><label style={{ fontSize:12, color:"#2563EB", fontWeight:600, display:"block", marginBottom:5 }}>Flag ✏️</label>
                    <select value={flag} onChange={e=>setFlag(e.target.value)} style={{ ...fS, border:"1.5px solid #2563EB" }}>{["R","T","G","Z"].map(f=><option key={f}>{f}</option>)}</select></div>
                  <div><label style={{ fontSize:12, color:"#2563EB", fontWeight:600, display:"block", marginBottom:5 }}>DPD ✏️</label><input style={{ ...fS, border:"1.5px solid #2563EB" }} value={dpd} onChange={e=>setDpd(e.target.value)} /></div>
                  <div><label style={{ fontSize:12, color:"#2563EB", fontWeight:600, display:"block", marginBottom:5 }}>POS (₹) ✏️</label><input style={{ ...fS, border:"1.5px solid #2563EB" }} value={pos} onChange={e=>setPos(e.target.value)} /></div>
                  <div><label style={{ fontSize:12, color:"#2563EB", fontWeight:600, display:"block", marginBottom:5 }}>OD (₹) ✏️</label><input style={{ ...fS, border:"1.5px solid #2563EB" }} value={od} onChange={e=>setOd(e.target.value)} /></div>
                  <div style={{ gridColumn:"span 3" }}><label style={{ fontSize:12, color:"#2563EB", fontWeight:600, display:"block", marginBottom:5 }}>Correction Method ✏️</label>
                    <select value={correctionMethod} onChange={e=>setCorrectionMethod(e.target.value)} style={{ ...fS, border:"1.5px solid #2563EB" }}>
                      {["Data Correction","Accept Deviation","Escalate to Head Office","No Action Required"].map(o=><option key={o}>{o}</option>)}
                    </select></div>
                </div>
              </div>
            )}

            {activeTab==="history" && (
              <div style={{ padding:24 }}>
                {history.map((h,i)=>(
                  <div key={i} style={{ display:"flex", gap:16, paddingBottom:20 }}>
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:h.type==="system"?"#F1F5F9":"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{h.type==="system"?"⚙️":h.type==="assign"?"👤":"👁️"}</div>
                      {i<history.length-1 && <div style={{ width:2, flex:1, background:"#E2E8F0", marginTop:4 }} />}
                    </div>
                    <div style={{ paddingTop:4 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0A2342" }}>{h.action}</div>
                      <div style={{ fontSize:12, color:"#94A3B8", marginTop:2 }}>{h.user} · {h.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"#fff", borderRadius:12, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:700, color:"#0A2342", fontSize:14, marginBottom:4 }}>Review Note <span style={{ color:"#DC3545" }}>*</span></div>
            <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>Mandatory — explain the correction or why the deviation is acceptable.</p>
            <textarea rows={5} value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. DPD was incorrectly mapped due to system migration..."
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:`1.5px solid ${note?"#2563EB":"#E2E8F0"}`, fontSize:13, resize:"vertical", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", outline:"none", color:"#0A2342", lineHeight:1.6 }} />
            <div style={{ textAlign:"right", fontSize:11, color:"#94A3B8", marginTop:4 }}>{note.length} chars</div>
          </div>

          <div style={{ background:"#F0FDF4", borderRadius:12, padding:18, border:"1px solid #BBF7D0" }}>
            <div style={{ fontWeight:700, color:"#155724", fontSize:13, marginBottom:10 }}>📋 Change Summary</div>
            {[["Flag",deviation.flag,flag],["DPD",deviation.dpd.toString(),dpd],["POS",deviation.pos,pos],["OD",deviation.od,od],["Correction",deviation.correctionMethod,correctionMethod]].map(([l,o,c])=>{
              const changed = o!==c && o!=="Pending";
              return (
                <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:8, fontSize:13 }}>
                  <span style={{ color:"#64748B", fontWeight:600 }}>{l}</span>
                  <span style={{ color:changed?"#DC3545":"#334155", fontWeight:changed?700:400 }}>{changed?<span>{o} <span style={{ color:"#10B981" }}>→ {c}</span></span>:c}</span>
                </div>
              );
            })}
          </div>

          <div style={{ background:"#fff", borderRadius:12, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <button onClick={handleSubmit} style={{ width:"100%", background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginBottom:10 }}>✓ Submit for Approval</button>
            <button onClick={onBack} style={{ width:"100%", background:"#F8FAFC", color:"#64748B", border:"1.5px solid #E2E8F0", borderRadius:10, padding:"11px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Back to List</button>
            <p style={{ fontSize:11, color:"#94A3B8", textAlign:"center", margin:"10px 0 0" }}>Submission notifies the Org Unit Head</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 3 — APPROVAL DETAIL (PENDING QUEUE)
// ══════════════════════════════════════════════════════════════════
function ApprovalDetailPage() {
  const [selected, setSelected] = useState(pendingApprovals[0]);
  const [approverNote, setApproverNote] = useState("");
  const [actionDone, setActionDone] = useState(null);
  const [dismissed, setDismissed] = useState([]);

  const visible = pendingApprovals.filter(d=>!dismissed.includes(d.id));

  const handleAction = (type) => {
    if (!approverNote.trim()) { alert("Please add an approver remark before proceeding."); return; }
    setActionDone({ type, id:selected.id });
    setDismissed(p=>[...p,selected.id]);
    setApproverNote("");
    const next = visible.find(d=>d.id!==selected.id);
    if (next) setSelected(next); else setSelected(null);
  };

  const fieldRow = (label,orig,updated) => {
    const changed = orig!==updated;
    return (
      <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 1fr", gap:12, padding:"10px 0", borderBottom:"1px solid #E2E8F0", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:13, color:changed?"#94A3B8":"#334155", textDecoration:changed?"line-through":"none", fontFamily:"monospace" }}>{orig}</span>
        <span style={{ fontSize:13, fontWeight:700, color:changed?"#16A34A":"#334155", fontFamily:"monospace" }}>{updated}{changed&&<span style={{ marginLeft:6, fontSize:10, background:"#D1FAE5", color:"#065F46", padding:"1px 6px", borderRadius:4 }}>CHANGED</span>}</span>
      </div>
    );
  };

  return (
    <div style={{ display:"flex", height:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Queue */}
      <div style={{ width:300, borderRight:"1px solid #E2E8F0", display:"flex", flexDirection:"column", flexShrink:0, background:"#fff", boxShadow:"1px 0 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #E2E8F0" }}>
          <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Pending Approvals</div>
          <div style={{ fontSize:26, fontWeight:800, color:"#0A2342" }}>{visible.length} <span style={{ fontSize:13, color:"#64748B", fontWeight:400 }}>awaiting decision</span></div>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {visible.length===0 && <div style={{ padding:32, textAlign:"center", color:"#94A3B8", fontSize:13 }}><div style={{ fontSize:36, marginBottom:12 }}>✅</div>All approvals processed!</div>}
          {visible.map(d=>(
            <div key={d.id} onClick={()=>setSelected(d)} style={{ padding:"15px 20px", borderBottom:"1px solid #F1F5F9", cursor:"pointer", background:selected?.id===d.id?"#EFF6FF":"transparent", borderLeft:selected?.id===d.id?"3px solid #2563EB":"3px solid transparent", transition:"all 0.15s" }}
              onMouseEnter={e=>{ if(selected?.id!==d.id) e.currentTarget.style.background="#F8FAFC"; }}
              onMouseLeave={e=>{ if(selected?.id!==d.id) e.currentTarget.style.background="transparent"; }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#2563EB" }}>{d.id}</span>
                <PriorityBadge p={d.priority} />
              </div>
              <div style={{ fontSize:11, color:"#94A3B8", fontFamily:"monospace", marginBottom:4 }}>{maskContractNumber(d.contractNo)}</div>
              <div style={{ fontSize:12, color:"#334155" }}>{d.product} · {d.branch}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:4 }}>{maskCustomerName(d.customerName)} · Rule {d.ruleId} · {d.reviewer}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex:1, overflowY:"auto", padding:"24px 28px" }}>
        {actionDone && (
          <div style={{ background:actionDone.type==="approve"?"#D1FAE5":actionDone.type==="reject"?"#FEE2E2":"#FEF3C7", border:`1px solid ${actionDone.type==="approve"?"#6EE7B7":actionDone.type==="reject"?"#FCA5A5":"#FDE68A"}`, borderRadius:10, padding:"12px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:18 }}>{actionDone.type==="approve"?"✅":actionDone.type==="reject"?"❌":"↩️"}</span>
            <span style={{ color:"#0A2342", fontSize:13, fontWeight:600 }}>{actionDone.id} — <strong>{actionDone.type==="approve"?"Approved":actionDone.type==="reject"?"Rejected":"Sent Back"}</strong>. Reviewer notified.</span>
            <button onClick={()=>setActionDone(null)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#94A3B8", cursor:"pointer", fontSize:18 }}>×</button>
          </div>
        )}

        {!selected ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60vh", color:"#94A3B8" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#64748B" }}>No pending approvals</div>
          </div>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                  <span style={{ fontSize:20, fontWeight:900, color:"#0A2342" }}>{selected.id}</span>
                  <PriorityBadge p={selected.priority} />
                  <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:6 }}>Rule {selected.ruleId}</span>
                </div>
                <div style={{ fontFamily:"monospace", color:"#2563EB", fontSize:12, marginBottom:3 }}>{maskContractNumber(selected.contractNo)}</div>
                <div style={{ color:"#64748B", fontSize:12 }}>{maskCustomerName(selected.customerName)} · {selected.product} · {selected.branch} · {selected.contractDate}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11, color:"#94A3B8", marginBottom:2 }}>Submitted</div>
                <div style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{selected.submittedOn}</div>
              </div>
            </div>

            <div style={{ background:"#FFF3CD", border:"1px solid #FBBF24", borderRadius:10, padding:"13px 18px", marginBottom:20, display:"flex", gap:12 }}>
              <span style={{ fontSize:16 }}>⚠️</span>
              <div><div style={{ color:"#78350F", fontWeight:700, fontSize:13, marginBottom:2 }}>Rule {selected.ruleId} Violation</div><div style={{ color:"#92400E", fontSize:12 }}>{selected.ruleDesc}</div></div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div style={{ background:"#fff", borderRadius:12, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:12 }}>Contract Info</div>
                {[["Customer Name",maskCustomerName(selected.customerName)],["Date of Birth",maskDOB(selected.dob)],["Phone",maskPhoneNumber(selected.phone)],["Finance Amt",`₹${selected.financeAmt}`],["EMI",`₹${selected.emi}`],["Reviewer",selected.reviewer],["Reviewed On",selected.reviewedOn]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", marginBottom:9 }}>
                    <span style={{ fontSize:12, color:"#64748B" }}>{l}</span><span style={{ fontSize:13, color:"#0A2342", fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background:"#fff", borderRadius:12, padding:18, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:10 }}>Reviewer's Note</div>
                <p style={{ margin:0, fontSize:13, color:"#64748B", lineHeight:1.7, fontStyle:"italic" }}>"{selected.reviewNote}"</p>
              </div>
            </div>

            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:16 }}>
              <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>Data Comparison — Original vs Corrected</div>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 14px" }}>Green values indicate fields changed by the reviewer. Review before deciding.</p>
              <div style={{ display:"grid", gridTemplateColumns:"120px 1fr 1fr", gap:12, marginBottom:8 }}>
                <span style={{ fontSize:11, color:"#64748B", fontWeight:700 }}>FIELD</span>
                <span style={{ fontSize:11, color:"#64748B", fontWeight:700 }}>ORIGINAL</span>
                <span style={{ fontSize:11, color:"#2563EB", fontWeight:700 }}>CORRECTED</span>
              </div>
              {fieldRow("Flag", selected.originalData.flag, selected.updatedData.flag)}
              {fieldRow("DPD",  selected.originalData.dpd,  selected.updatedData.dpd)}
              {fieldRow("POS",  selected.originalData.pos,  selected.updatedData.pos)}
              {fieldRow("OD",   selected.originalData.od,   selected.updatedData.od)}
              {fieldRow("Method", selected.originalData.correctionMethod, selected.updatedData.correctionMethod)}
            </div>

            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:16 }}>
              <div style={{ fontWeight:700, color:"#0A2342", fontSize:14, marginBottom:4 }}>Approver Remark <span style={{ color:"#DC3545" }}>*</span></div>
              <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 10px" }}>Required for all actions. This will be recorded in the audit trail.</p>
              <textarea rows={3} value={approverNote} onChange={e=>setApproverNote(e.target.value)} placeholder="e.g. Correction validated against CBS data. Approved."
                style={{ width:"100%", padding:"11px 13px", borderRadius:8, border:`1.5px solid ${approverNote?"#2563EB":"#E2E8F0"}`, fontSize:13, resize:"vertical", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box", outline:"none", color:"#0A2342", background:"#fff", lineHeight:1.7 }} />
              <div style={{ textAlign:"right", fontSize:11, color:"#94A3B8", marginTop:4 }}>{approverNote.length} chars</div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <button onClick={()=>handleAction("approve")} style={{ padding:"15px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, background:"linear-gradient(135deg,#15803D,#22C55E)", color:"#fff", boxShadow:"0 4px 12px rgba(34,197,94,0.25)" }}>✓ Approve</button>
              <button onClick={()=>handleAction("sendback")} style={{ padding:"15px", borderRadius:10, border:"1.5px solid #F59E0B", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, background:"#FFFBEB", color:"#92400E" }}>↩ Send Back</button>
              <button onClick={()=>handleAction("reject")} style={{ padding:"15px", borderRadius:10, border:"1.5px solid #EF4444", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, background:"#FFF5F5", color:"#991B1B" }}>✕ Reject</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 4 — APPROVAL HISTORY
// ══════════════════════════════════════════════════════════════════
function ApprovalHistoryPage() {
  const [filterAction, setFilterAction] = useState("All");
  const [filterProduct, setFilterProduct] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = historyData.filter(d => {
    const mA = filterAction==="All" || d.action===filterAction;
    const mP = filterProduct==="All" || d.product===filterProduct;
    const mS = d.contractNo.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase()) || d.reviewer.toLowerCase().includes(search.toLowerCase());
    return mA && mP && mS;
  });

  const counts = { approved: historyData.filter(d=>d.action==="Approved").length, rejected: historyData.filter(d=>d.action==="Rejected").length, sentBack: historyData.filter(d=>d.action==="Sent Back").length };

  return (
    <div style={{ background:"#F0F2F7", minHeight:"calc(100vh - 95px)", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>Approval History</h1>
        <p style={{ margin:"5px 0 0", color:"#64748B", fontSize:13 }}>Complete log of all approval decisions made by you across RBI compliance deviations.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Processed", value:historyData.length, color:"#0A2342", bg:"#fff",    accent:"#2563EB" },
          { label:"Approved",        value:counts.approved,    color:"#155724", bg:"#F0FDF4", accent:"#28A745" },
          { label:"Rejected",        value:counts.rejected,    color:"#721C24", bg:"#FFF5F5", accent:"#DC3545" },
          { label:"Sent Back",       value:counts.sentBack,    color:"#856404", bg:"#FFFBEB", accent:"#F0AD4E" },
        ].map(c=>(
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize:11, color:"#64748B", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{c.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:"#fff", borderRadius:12, padding:"14px 20px", marginBottom:16, display:"flex", gap:16, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:200, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contract, deviation ID, reviewer..."
            style={{ width:"100%", padding:"9px 12px 9px 36px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }} />
        </div>
        {[{ label:"Action:", value:filterAction, set:setFilterAction, opts:["All","Approved","Rejected","Sent Back"] },{ label:"Product:", value:filterProduct, set:setFilterProduct, opts:["All","Vehicle Loan","Tractor Loan","Commercial Vehicle"] }].map(f=>(
          <div key={f.label} style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{f.label}</span>
            <select value={f.value} onChange={e=>f.set(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span style={{ color:"#64748B", fontSize:13 }}>{filtered.length} records</span>
      </div>

      <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
              {["Deviation ID","Contract No.","Customer Name","Product","Branch","Rule","Reviewer","Action","Date & Time",""].map(h=>(
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d,i)=>(
              <>
                <tr key={d.id} style={{ borderBottom:"1px solid #F1F5F9", background:expanded===d.id?"#EFF6FF":i%2===0?"#fff":"#FAFBFC", cursor:"pointer" }}
                  onMouseEnter={e=>{ if(expanded!==d.id) e.currentTarget.style.background="#EFF6FF"; }}
                  onMouseLeave={e=>{ if(expanded!==d.id) e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"; }}>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#2563EB", fontWeight:700 }}>{d.id}</td>
                  <td style={{ padding:"12px 14px", fontSize:11, color:"#0A2342", fontFamily:"monospace", fontWeight:600 }}>{maskContractNumber(d.contractNo)}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>{maskCustomerName(d.customerName)}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>{d.product}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#64748B" }}>{d.branch}</td>
                  <td style={{ padding:"12px 14px" }}><span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"3px 8px", borderRadius:6 }}>R{d.ruleId}</span></td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>{d.reviewer}</td>
                  <td style={{ padding:"12px 14px" }}><ActionBadge a={d.action} /></td>
                  <td style={{ padding:"12px 14px", fontSize:12, color:"#64748B" }}>{d.actionDate}</td>
                  <td style={{ padding:"12px 14px" }}>
                    <button onClick={()=>setExpanded(expanded===d.id?null:d.id)} style={{ background:"#EFF6FF", color:"#1D4ED8", border:"none", borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      {expanded===d.id?"▲ Hide":"▼ Details"}
                    </button>
                  </td>
                </tr>
                {expanded===d.id && (
                  <tr key={d.id+"-exp"} style={{ background:"#F0F6FF", borderBottom:"1px solid #E2E8F0" }}>
                    <td colSpan={10} style={{ padding:"0 16px 18px 48px" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, paddingTop:14 }}>
                        <div style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #E2E8F0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>Customer Information</div>
                          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                            <div style={{ fontSize:12, color:"#64748B" }}>Name: <span style={{ color:"#0A2342", fontWeight:600 }}>{maskCustomerName(d.customerName)}</span></div>
                            <div style={{ fontSize:12, color:"#64748B" }}>DOB: <span style={{ color:"#0A2342", fontWeight:600 }}>{maskDOB(d.dob)}</span></div>
                            <div style={{ fontSize:12, color:"#64748B" }}>Phone: <span style={{ color:"#0A2342", fontWeight:600 }}>{maskPhoneNumber(d.phone)}</span></div>
                          </div>
                        </div>
                        <div style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #E2E8F0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>Reviewer's Note</div>
                          <p style={{ margin:0, fontSize:13, color:"#64748B", lineHeight:1.7, fontStyle:"italic" }}>"{d.approverNote}"</p>
                        </div>
                        <div style={{ background:"#fff", borderRadius:10, padding:14, border:"1px solid #E2E8F0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
                          <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>Approver's Remark</div>
                          <p style={{ margin:0, fontSize:13, color:"#64748B", lineHeight:1.7, fontStyle:"italic" }}>"{d.approverNote}"</p>
                          <div style={{ marginTop:10, display:"flex", gap:14 }}>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>By: <span style={{ color:"#2563EB", fontWeight:700 }}>{d.approver}</span></div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>On: <span style={{ color:"#64748B" }}>{d.actionDate}</span></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div style={{ padding:48, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No records match the current filters.</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 5 — RULES MASTER LIST (ALL ROLES)
// ══════════════════════════════════════════════════════════════════

// Full 39 rules with category grouping
const allRules = [
  { id:1,  desc:"Validation of LR (Last year LR + new-Close = CY Live)",                                     category:"LR Validation",    hasDeviations:false },
  { id:2,  desc:"Contract date before 1 April 2023 must be in March 2023 RBI LR, else REMOVED",              category:"LR Validation",    hasDeviations:false },
  { id:3,  desc:"Flag validation – LY T/Z/G flag vs CY status",                                              category:"Flag & Status",     hasDeviations:true  },
  { id:4,  desc:"Live, OD >= POS",                                                                           category:"OD / POS",          hasDeviations:false },
  { id:5,  desc:"Matured, POS > 0, OD <= 0",                                                                category:"OD / POS",          hasDeviations:false },
  { id:6,  desc:"Matured, OD >= POS",                                                                        category:"OD / POS",          hasDeviations:false },
  { id:7,  desc:"POS > 0, OD > 0",                                                                           category:"OD / POS",          hasDeviations:false },
  { id:8,  desc:"POS <= 0, DPD < 0",                                                                         category:"DPD",               hasDeviations:false },
  { id:9,  desc:"Repo, POS > 0, OD >= 0",                                                                    category:"OD / POS",          hasDeviations:false },
  { id:10, desc:"Plot Customer DPD into fuel credit customer ID & check portfolio bucket wise",               category:"DPD",               hasDeviations:false },
  { id:11, desc:"R flag DPD > 0, OD > 0, for all POS > 0",                                                  category:"Flag & Status",     hasDeviations:true  },
  { id:12, desc:"Grouping & Bucket wise Product wise O/S",                                                   category:"Portfolio",         hasDeviations:false },
  { id:13, desc:"Matured POS > 0 then OD > 0",                                                              category:"OD / POS",          hasDeviations:false },
  { id:14, desc:"Matured OD > 0 then POS > 0; if POS = 0 How?",                                             category:"OD / POS",          hasDeviations:false },
  { id:15, desc:"Live OD not > POS, except DA",                                                              category:"OD / POS",          hasDeviations:false },
  { id:16, desc:"For DA, 100% POS should >= OD",                                                             category:"OD / POS",          hasDeviations:false },
  { id:17, desc:"First EMI date after contract date should be valid",                                         category:"EMI / Dates",       hasDeviations:true  },
  { id:18, desc:"IRR contract wise should be as per agreement",                                              category:"IRR",               hasDeviations:false },
  { id:19, desc:"Asset cost and depreciated value vs POS — segregate Secured & Unsecured",                  category:"Asset",             hasDeviations:false },
  { id:20, desc:"RPS year wise POS",                                                                         category:"Portfolio",         hasDeviations:false },
  { id:21, desc:"Selection of Macro",                                                                        category:"Macro",             hasDeviations:false },
  { id:22, desc:"Weightage of Macro",                                                                        category:"Macro",             hasDeviations:false },
  { id:23, desc:"UCIC code check",                                                                           category:"Customer",          hasDeviations:false },
  { id:24, desc:"Consolidated LR with UCIC level IRAC classification aligned with financial disclosures",    category:"Customer",          hasDeviations:false },
  { id:25, desc:"POS > Finance amount for contracts > 1 year old must be in NPA",                           category:"NPA",               hasDeviations:true  },
  { id:26, desc:"Default date and NPA date to be mapped contract wise",                                      category:"NPA",               hasDeviations:true  },
  { id:27, desc:"NPA customer new business after default date",                                              category:"NPA",               hasDeviations:true  },
  { id:28, desc:"Borrower and Co-Borrower DPD across all products should be same",                          category:"DPD",               hasDeviations:false },
  { id:29, desc:"Co-borrower link no. to be validated and DPD updated accordingly",                          category:"DPD",               hasDeviations:false },
  { id:30, desc:"Last EMI date should align with contract date",                                             category:"EMI / Dates",       hasDeviations:true  },
  { id:31, desc:"Duplicate contract number across multiple loan registers with different flag",               category:"Duplicates",        hasDeviations:true  },
  { id:32, desc:"Same UCIC with different PAN / Aadhar",                                                    category:"Customer",          hasDeviations:false },
  { id:33, desc:"Same PAN / Aadhar with different UCIC",                                                    category:"Customer",          hasDeviations:false },
  { id:34, desc:"Vehicle master details validation (engine no., chassis no., registration no.)",             category:"Asset",             hasDeviations:false },
  { id:35, desc:"PAN basic validation",                                                                      category:"Customer",          hasDeviations:false },
  { id:36, desc:"Null & blank value check for all columns",                                                  category:"Data Quality",      hasDeviations:false },
  { id:37, desc:"APR validation — mandatory after Oct-2024",                                                 category:"IRR",               hasDeviations:false },
  { id:38, desc:"Mobile number basic validation",                                                            category:"Customer",          hasDeviations:false },
  { id:39, desc:"DOB abnormal gap — age < 21 or > 65",                                                      category:"Customer",          hasDeviations:false },
];

const categoryColors = {
  "LR Validation": ["#EFF6FF","#1D4ED8"],
  "Flag & Status":  ["#FEF3C7","#92400E"],
  "OD / POS":       ["#F0FDF4","#15803D"],
  "DPD":            ["#FFF5F5","#991B1B"],
  "NPA":            ["#FEF9C3","#713F12"],
  "EMI / Dates":    ["#F5F3FF","#6D28D9"],
  "Portfolio":      ["#ECFEFF","#0E7490"],
  "Customer":       ["#FDF4FF","#7E22CE"],
  "Asset":          ["#FFF7ED","#C2410C"],
  "IRR":            ["#F0F9FF","#0369A1"],
  "Macro":          ["#F8FAFC","#475569"],
  "Duplicates":     ["#FFF1F2","#9F1239"],
  "Data Quality":   ["#F0FDF4","#166534"],
};

function RulesMasterList({ onViewRule, activeRole }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterDev, setFilterDev] = useState("All");

  const categories = ["All", ...Array.from(new Set(allRules.map(r => r.category)))];
  const devCounts = {};
  deviations.forEach(d => { devCounts[d.ruleId] = (devCounts[d.ruleId] || 0) + 1; });

  const filtered = allRules.filter(r => {
    const ms = r.desc.toLowerCase().includes(search.toLowerCase()) || String(r.id).includes(search);
    const mc = filterCat === "All" || r.category === filterCat;
    const md = filterDev === "All" || (filterDev === "With Deviations" ? r.hasDeviations : !r.hasDeviations);
    return ms && mc && md;
  });

  const totalWithDev = allRules.filter(r => r.hasDeviations).length;
  const totalDeviations = deviations.length;

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>Rules Master List</h1>
        <p style={{ margin:"4px 0 0", color:"#64748B", fontSize:13 }}>All 39 RBI compliance validation rules used for deviation detection across the loan register.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Total Rules",        value:39,            color:"#0A2342", bg:"#fff",    accent:"#2563EB" },
          { label:"Rules with Deviations", value:totalWithDev, color:"#856404", bg:"#FFFBEB", accent:"#F0AD4E" },
          { label:"Total Deviations Found", value:totalDeviations, color:"#721C24", bg:"#FFF5F5", accent:"#DC3545" },
          { label:"Categories",         value:categories.length - 1, color:"#155724", bg:"#F0FDF4", accent:"#28A745" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{c.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", borderRadius:12, padding:"14px 20px", marginBottom:16, display:"flex", gap:16, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search rule ID or description..."
            style={{ width:"100%", padding:"9px 12px 9px 36px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Category:</span>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            {categories.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Status:</span>
          <select value={filterDev} onChange={e=>setFilterDev(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            <option value="All">All Rules</option>
            <option value="With Deviations">With Deviations</option>
            <option value="No Deviations">No Deviations</option>
          </select>
        </div>
        <span style={{ color:"#64748B", fontSize:13, marginLeft:"auto" }}>{filtered.length} rules</span>
      </div>

      {/* Rules Table */}
      <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
              {["Rule ID","Description","Category","Deviations Found","Status",""].map(h => (
                <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const [catBg, catText] = categoryColors[r.category] || ["#F1F5F9","#475569"];
              const devCount = devCounts[r.id] || 0;
              return (
                <tr key={r.id} style={{ borderBottom:"1px solid #F1F5F9", background: i%2===0?"#fff":"#FAFBFC" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"}>
                  <td style={{ padding:"13px 16px" }}>
                    <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:13, fontWeight:800, padding:"4px 10px", borderRadius:7 }}>Rule {r.id}</span>
                  </td>
                  <td style={{ padding:"13px 16px", fontSize:13, color:"#334155", maxWidth:380 }}>{r.desc}</td>
                  <td style={{ padding:"13px 16px" }}>
                    <span style={{ background:catBg, color:catText, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{r.category}</span>
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    {devCount > 0
                      ? <span style={{ background:"#FFF5F5", color:"#991B1B", fontWeight:800, fontSize:13, padding:"3px 12px", borderRadius:20, border:"1px solid #FECACA" }}>{devCount} deviation{devCount>1?"s":""}</span>
                      : <span style={{ color:"#94A3B8", fontSize:13 }}>—</span>}
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    {r.hasDeviations
                      ? <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#FFF3CD", color:"#856404", fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#F0AD4E", display:"inline-block" }}/>Needs Review</span>
                      : <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#D4EDDA", color:"#155724", fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20 }}><span style={{ width:6, height:6, borderRadius:"50%", background:"#28A745", display:"inline-block" }}/>Clean</span>}
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    {r.hasDeviations && activeRole === "reviewer" ? (
                      <button onClick={() => onViewRule(r)}
                        style={{ background:"#0A2342", color:"#fff", border:"none", borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        View Deviations →
                      </button>
                    ) : r.hasDeviations ? (
                      <span style={{ fontSize:12, color:"#94A3B8" }}>Reviewer only</span>
                    ) : (
                      <span style={{ fontSize:12, color:"#CBD5E1" }}>No action</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding:48, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No rules match the current filters.</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 6 — RULE-WISE DEVIATION VIEW (REVIEWER)
// ══════════════════════════════════════════════════════════════════
function RuleWiseDeviationView({ selectedRule, onSelectDeviation, onBack }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const ruleDeviations = deviations.filter(d => d.ruleId === selectedRule.id);
  const filtered = ruleDeviations.filter(d => {
    const ms = d.contractNo.toLowerCase().includes(search.toLowerCase()) || d.branch.toLowerCase().includes(search.toLowerCase()) || d.product.toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === "All" || d.status === filterStatus;
    return ms && mst;
  });

  const counts = {
    total:   ruleDeviations.length,
    pending: ruleDeviations.filter(d=>d.status==="Pending Review").length,
    reviewed:ruleDeviations.filter(d=>d.status==="Reviewed").length,
    escalated:ruleDeviations.filter(d=>d.status==="Escalated").length,
  };

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      {/* Breadcrumb */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#2563EB", fontSize:13, cursor:"pointer", padding:0, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>← Rules Master List</button>
        <span style={{ color:"#CBD5E1" }}>›</span>
        <span style={{ color:"#0A2342", fontSize:13, fontWeight:600 }}>Rule {selectedRule.id}</span>
      </div>

      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>Rule {selectedRule.id} — Deviation View</h1>
          <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:8 }}>{selectedRule.category}</span>
        </div>
        <p style={{ margin:0, color:"#64748B", fontSize:13 }}>{selectedRule.desc}</p>
      </div>

      {/* Rule description banner */}
      <div style={{ background:"#FFF3CD", border:"1px solid #FBBF24", borderRadius:10, padding:"14px 20px", marginBottom:22, display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight:700, color:"#78350F", fontSize:14, marginBottom:2 }}>Rule Definition</div>
          <div style={{ color:"#92400E", fontSize:13 }}>{selectedRule.desc}</div>
          <div style={{ color:"#B45309", fontSize:12, marginTop:6 }}>All contracts below have been flagged because they violate this rule. Review each one and submit for approval.</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Total Flagged",  value:counts.total,     color:"#0A2342", bg:"#fff",    accent:"#2563EB" },
          { label:"Pending Review", value:counts.pending,   color:"#856404", bg:"#FFFBEB", accent:"#F0AD4E" },
          { label:"Reviewed",       value:counts.reviewed,  color:"#155724", bg:"#F0FDF4", accent:"#28A745" },
          { label:"Escalated",      value:counts.escalated, color:"#721C24", bg:"#FFF5F5", accent:"#DC3545" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"16px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:5 }}>{c.label}</div>
            <div style={{ fontSize:30, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", borderRadius:12, padding:"14px 20px", marginBottom:14, display:"flex", gap:16, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220, position:"relative" }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contract, product, branch..."
            style={{ width:"100%", padding:"9px 12px 9px 36px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>Status:</span>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            <option value="All">All Status</option>
            {Object.keys(statusColors).map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <span style={{ color:"#64748B", fontSize:13, marginLeft:"auto" }}>{filtered.length} contracts</span>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
              {["Deviation ID","Contract No.","Contract Date","Product","Branch","Flag","DPD","POS (₹)","OD (₹)","Status","Action"].map(h => (
                <th key={h} style={{ padding:"12px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr key={d.id} style={{ borderBottom:"1px solid #F1F5F9", background: i%2===0?"#fff":"#FAFBFC" }}
                onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"}>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#2563EB", fontWeight:700 }}>{d.id}</td>
                <td style={{ padding:"12px 14px", fontSize:11, color:"#0A2342", fontFamily:"monospace", fontWeight:600 }}>{d.contractNo}</td>
                <td style={{ padding:"12px 14px", fontSize:12, color:"#64748B" }}>{d.contractDate}</td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>{d.product}</td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>{d.branch}</td>
                <td style={{ padding:"12px 14px" }}>
                  <span style={{ background:"#F1F5F9", color:"#334155", fontSize:12, fontWeight:700, padding:"3px 8px", borderRadius:6 }}>{d.flag}</span>
                </td>
                <td style={{ padding:"12px 14px", fontSize:13, fontWeight:700, color:d.dpd>0?"#DC3545":"#334155" }}>{d.dpd}</td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>₹{d.pos}</td>
                <td style={{ padding:"12px 14px", fontSize:13, color:"#334155" }}>₹{d.od}</td>
                <td style={{ padding:"12px 14px" }}><StatusBadge status={d.status} /></td>
                <td style={{ padding:"12px 14px" }}>
                  <button onClick={() => onSelectDeviation(d)}
                    style={{ background:"#0A2342", color:"#fff", border:"none", borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                    Review →
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} style={{ padding:40, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No contracts match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 7 — ORG UNIT / PERMISSION CONFIGURATION (ADMIN)
// ══════════════════════════════════════════════════════════════════
const orgUnitsData = [
  { id:"OU-01", name:"Chennai - Central", region:"Tamil Nadu", head:"Ramesh Chandran", headEmail:"ramesh.c@hfl.in",  reviewers:["Priya Menon","Kavitha S"],  branches:["Anna Nagar","T. Nagar","Adyar"],          permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:true,  exportData:false }, ruleAccess:[3,11,25,26,27,31], status:"Active",   contracts:1840 },
  { id:"OU-02", name:"Chennai - North",   region:"Tamil Nadu", head:"Nirmala T",       headEmail:"nirmala.t@hfl.in", reviewers:["Arjun Rajan"],              branches:["Perambur","Kolathur","Ambattur"],          permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:true,  exportData:false }, ruleAccess:[3,17,26,30],       status:"Active",   contracts:1120 },
  { id:"OU-03", name:"Coimbatore",        region:"Tamil Nadu", head:"Venkat R",        headEmail:"venkat.r@hfl.in",  reviewers:["Arjun Rajan","Mohan R"],    branches:["RS Puram","Gandhipuram","Peelamedu"],      permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:true,  exportData:true  }, ruleAccess:[3,11,17,25,30,31], status:"Active",   contracts:980  },
  { id:"OU-04", name:"Madurai",           region:"Tamil Nadu", head:"Selvam K",        headEmail:"selvam.k@hfl.in",  reviewers:["Kavitha S"],                branches:["KK Nagar","Mattuthavani"],                permissions:{ viewDeviations:true,  editDeviations:false, approveDeviations:false, viewReports:true,  exportData:false }, ruleAccess:[3,25,30],          status:"Active",   contracts:640  },
  { id:"OU-05", name:"Tiruppur",          region:"Tamil Nadu", head:"Suresh K",        headEmail:"suresh.k@hfl.in",  reviewers:["Suresh K"],                 branches:["Main Branch","Avinashi Rd"],              permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:false, exportData:false }, ruleAccess:[11,27,31],         status:"Active",   contracts:510  },
  { id:"OU-06", name:"Salem",             region:"Tamil Nadu", head:"Deepa V",         headEmail:"deepa.v@hfl.in",   reviewers:["Mohan R","Deepa V"],        branches:["Fairlands","Junction"],                   permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:true,  exportData:false }, ruleAccess:[17,26,30],         status:"Inactive", contracts:320  },
  { id:"OU-07", name:"Trichy",            region:"Tamil Nadu", head:"Babu M",          headEmail:"babu.m@hfl.in",    reviewers:["Deepa V"],                  branches:["Srirangam","Thillai Nagar"],              permissions:{ viewDeviations:true,  editDeviations:true,  approveDeviations:true,  viewReports:true,  exportData:false }, ruleAccess:[25,26,27],         status:"Active",   contracts:720  },
];

const permLabels = {
  viewDeviations:    { label:"View Deviations",  icon:"👁"  },
  editDeviations:    { label:"Edit Deviations",  icon:"✏️"  },
  approveDeviations: { label:"Approve",          icon:"✓"   },
  viewReports:       { label:"View Reports",     icon:"📊"  },
  exportData:        { label:"Export Data",      icon:"⬇️"  },
};

function OrgPermissionConfig() {
  const [selectedOU, setSelectedOU] = useState(orgUnitsData[0]);
  const [editMode, setEditMode]     = useState(false);
  const [editData, setEditData]     = useState(null);
  const [saved, setSaved]           = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch]         = useState("");

  const visibleOUs = orgUnitsData.filter(ou => {
    const ms = ou.name.toLowerCase().includes(search.toLowerCase()) || ou.head.toLowerCase().includes(search.toLowerCase());
    const mst = filterStatus === "All" || ou.status === filterStatus;
    return ms && mst;
  });

  const startEdit  = () => { setEditData(JSON.parse(JSON.stringify(selectedOU))); setEditMode(true); setSaved(false); };
  const cancelEdit = () => { setEditMode(false); setEditData(null); };
  const saveEdit   = () => { setEditMode(false); setSaved(true); setEditData(null); setTimeout(() => setSaved(false), 3000); };
  const current    = editMode ? editData : selectedOU;

  const togglePerm = (key) => { if (!editMode) return; setEditData(p => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } })); };
  const toggleRule = (id)  => {
    if (!editMode) return;
    setEditData(p => ({ ...p, ruleAccess: p.ruleAccess.includes(id) ? p.ruleAccess.filter(r=>r!==id) : [...p.ruleAccess, id].sort((a,b)=>a-b) }));
  };

  const sectionHead = (title) => (
    <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, marginBottom:12 }}>{title}</div>
  );

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", display:"flex" }}>

      {/* LEFT: Org Unit List */}
      <div style={{ width:272, background:"#fff", borderRight:"1px solid #E2E8F0", display:"flex", flexDirection:"column", flexShrink:0, boxShadow:"1px 0 4px rgba(0,0,0,0.04)" }}>
        <div style={{ padding:"20px 16px 12px" }}>
          <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Org Units</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#0A2342", marginBottom:14 }}>{orgUnitsData.length} <span style={{ fontSize:13, color:"#64748B", fontWeight:400 }}>configured</span></div>
          <div style={{ position:"relative", marginBottom:8 }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8", fontSize:13 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search unit or head..."
              style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
            <option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
          </select>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>
          {visibleOUs.map(ou => (
            <div key={ou.id} onClick={() => { setSelectedOU(ou); setEditMode(false); setEditData(null); setSaved(false); }}
              style={{ padding:"12px 16px", borderBottom:"1px solid #F1F5F9", cursor:"pointer", borderLeft:selectedOU.id===ou.id?"3px solid #2563EB":"3px solid transparent", background:selectedOU.id===ou.id?"#EFF6FF":"transparent", transition:"all 0.15s" }}
              onMouseEnter={e=>{ if(selectedOU.id!==ou.id) e.currentTarget.style.background="#F8FAFC"; }}
              onMouseLeave={e=>{ if(selectedOU.id!==ou.id) e.currentTarget.style.background="transparent"; }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:3 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#0A2342" }}>{ou.name}</span>
                <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, background:ou.status==="Active"?"#D4EDDA":"#F8D7DA", color:ou.status==="Active"?"#155724":"#721C24" }}>{ou.status}</span>
              </div>
              <div style={{ fontSize:11, color:"#64748B" }}>{ou.head}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{ou.contracts.toLocaleString()} contracts · {ou.ruleAccess.length} rules</div>
            </div>
          ))}
          {visibleOUs.length===0 && <div style={{ padding:24, textAlign:"center", color:"#94A3B8", fontSize:13 }}>No org units found.</div>}
        </div>
      </div>

      {/* RIGHT: Detail & Config */}
      <div style={{ flex:1, overflowY:"auto", padding:"26px 28px" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#0A2342" }}>{current.name}</h1>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:current.status==="Active"?"#D4EDDA":"#F8D7DA", color:current.status==="Active"?"#155724":"#721C24" }}>{current.status}</span>
              <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:6 }}>{current.id}</span>
            </div>
            <div style={{ color:"#64748B", fontSize:13 }}>Region: <strong>{current.region}</strong> · Head: <strong>{current.head}</strong> · {current.headEmail}</div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {saved && !editMode && <div style={{ display:"flex", alignItems:"center", gap:6, background:"#D4EDDA", color:"#155724", fontSize:12, fontWeight:700, padding:"8px 14px", borderRadius:8 }}>✓ Saved</div>}
            {!editMode
              ? <button onClick={startEdit} style={{ background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✏️ Edit Configuration</button>
              : <>
                  <button onClick={cancelEdit} style={{ background:"#F8FAFC", color:"#64748B", border:"1.5px solid #E2E8F0", borderRadius:8, padding:"9px 18px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                  <button onClick={saveEdit}   style={{ background:"linear-gradient(135deg,#15803D,#22C55E)", color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✓ Save Changes</button>
                </>
            }
          </div>
        </div>

        {editMode && (
          <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:10, padding:"11px 18px", marginBottom:18, fontSize:13, color:"#1E40AF", fontWeight:500 }}>
            ✏️ You are in edit mode — toggle permissions, rules and team below. Click Save Changes when done.
          </div>
        )}

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
          {[
            { label:"Contracts",   value:current.contracts.toLocaleString(), accent:"#2563EB", bg:"#fff"    },
            { label:"Branches",    value:current.branches.length,            accent:"#28A745", bg:"#F0FDF4" },
            { label:"Reviewers",   value:current.reviewers.length,           accent:"#F0AD4E", bg:"#FFFBEB" },
            { label:"Rule Access", value:current.ruleAccess.length,          accent:"#DC3545", bg:"#FFF5F5" },
          ].map(c=>(
            <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"16px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:5 }}>{c.label}</div>
              <div style={{ fontSize:28, fontWeight:800, color:"#0A2342", lineHeight:1 }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>

          {/* Permissions */}
          <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            {sectionHead("Permission Settings")}
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {Object.entries(permLabels).map(([key, meta]) => {
                const on = current.permissions[key];
                return (
                  <div key={key} onClick={()=>togglePerm(key)}
                    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderRadius:9, border:`1.5px solid ${editMode?(on?"#BFDBFE":"#E2E8F0"):"#F1F5F9"}`, background:on?"#F0F9FF":"#FAFBFC", cursor:editMode?"pointer":"default", transition:"all 0.15s", userSelect:"none" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:16 }}>{meta.icon}</span>
                      <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{meta.label}</span>
                    </div>
                    <div style={{ width:40, height:22, borderRadius:11, background:on?"#2563EB":"#CBD5E1", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:on?21:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team */}
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
              {sectionHead("Org Unit Head")}
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1D4ED8,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:16, flexShrink:0 }}>{current.head.charAt(0)}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0A2342" }}>{current.head}</div>
                  <div style={{ fontSize:12, color:"#64748B" }}>{current.headEmail}</div>
                  <div style={{ fontSize:11, color:"#2563EB", fontWeight:600, marginTop:2 }}>Can Approve · Can View Reports</div>
                </div>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flex:1 }}>
              {sectionHead(`Reviewers (${current.reviewers.length})`)}
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {current.reviewers.map(r=>(
                  <div key={r} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:"#F8FAFC", borderRadius:8, border:"1px solid #E2E8F0" }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:12, flexShrink:0 }}>{r.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{r}</div>
                      <div style={{ fontSize:11, color:"#94A3B8" }}>Can Review · Can Edit</div>
                    </div>
                    {editMode && <button style={{ marginLeft:"auto", background:"#FFF5F5", color:"#DC3545", border:"1px solid #FECACA", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Remove</button>}
                  </div>
                ))}
                {editMode && <button style={{ marginTop:4, padding:"8px", borderRadius:8, border:"1.5px dashed #BFDBFE", background:"#F0F9FF", color:"#2563EB", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>+ Add Reviewer</button>}
              </div>
            </div>
          </div>
        </div>

        {/* Branches */}
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", marginBottom:18 }}>
          {sectionHead(`Branches (${current.branches.length})`)}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {current.branches.map(b=>(
              <div key={b} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F1F5F9", borderRadius:8, padding:"7px 14px", fontSize:13, color:"#334155", fontWeight:600 }}>
                🏢 {b}
                {editMode && <span onClick={()=>{}} style={{ color:"#DC3545", cursor:"pointer", fontSize:15, marginLeft:2, lineHeight:1 }}>×</span>}
              </div>
            ))}
            {editMode && <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#F0F9FF", border:"1.5px dashed #BFDBFE", borderRadius:8, padding:"7px 14px", fontSize:13, color:"#2563EB", fontWeight:600, cursor:"pointer" }}>+ Add Branch</div>}
          </div>
        </div>

        {/* Rule Access */}
        <div style={{ background:"#fff", borderRadius:12, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
          {sectionHead("Rule Access Configuration")}
          <p style={{ margin:"0 0 14px", fontSize:13, color:"#64748B" }}>{editMode ? "Click a rule to toggle access for this org unit." : "Rules this org unit can view and act upon."}</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:8 }}>
            {allRules.filter(r=>r.hasDeviations).map(r=>{
              const on = current.ruleAccess.includes(r.id);
              return (
                <div key={r.id} onClick={()=>toggleRule(r.id)}
                  style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", borderRadius:9, border:`1.5px solid ${on?"#BFDBFE":"#E2E8F0"}`, background:on?"#F0F9FF":"#FAFBFC", cursor:editMode?"pointer":"default", transition:"all 0.15s", userSelect:"none" }}>
                  <div style={{ width:20, height:20, borderRadius:5, border:`2px solid ${on?"#2563EB":"#CBD5E1"}`, background:on?"#2563EB":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.15s" }}>
                    {on && <span style={{ color:"#fff", fontSize:11, fontWeight:800, lineHeight:1 }}>✓</span>}
                  </div>
                  <div>
                    <span style={{ fontSize:12, fontWeight:700, color:on?"#1D4ED8":"#94A3B8" }}>Rule {r.id}</span>
                    <div style={{ fontSize:12, color:on?"#334155":"#94A3B8", marginTop:1, lineHeight:1.4 }}>{r.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 8 — DASHBOARD (Reviewer + Org Unit Head)
// ══════════════════════════════════════════════════════════════════
function Dashboard({ activeRole, navigate }) {
  const isReviewer = activeRole === "reviewer";

  // ── Reviewer metrics ──────────────────────────────────────────
  const myDeviations   = deviations.filter(d => d.reviewer === "Priya Menon");
  const myPending      = myDeviations.filter(d => d.status === "Pending Review");
  const myReviewed     = myDeviations.filter(d => d.status === "Reviewed");
  const myEscalated    = myDeviations.filter(d => d.status === "Escalated");
  const myUnder        = myDeviations.filter(d => d.status === "Under Review");
  const completionPct  = myDeviations.length ? Math.round((myReviewed.length / myDeviations.length) * 100) : 0;

  // Rule breakdown for reviewer
  const ruleBreakdown = rules.map(r => ({
    ...r,
    count: deviations.filter(d => d.ruleId === r.id).length,
  })).filter(r => r.count > 0).sort((a,b) => b.count - a.count);

  // Product breakdown
  const productCounts = {};
  deviations.forEach(d => { productCounts[d.product] = (productCounts[d.product]||0)+1; });
  const productBreakdown = Object.entries(productCounts).map(([k,v])=>({label:k,value:v})).sort((a,b)=>b.value-a.value);
  const productColors = ["#2563EB","#F0AD4E","#28A745","#DC3545","#7C3AED"];

  // ── Head metrics ──────────────────────────────────────────────
  const totalPending   = pendingApprovals.length;
  const highPriority   = pendingApprovals.filter(d=>d.priority==="High").length;
  const approved       = historyData.filter(d=>d.action==="Approved").length;
  const rejected       = historyData.filter(d=>d.action==="Rejected").length;
  const sentBack       = historyData.filter(d=>d.action==="Sent Back").length;
  const totalProcessed = historyData.length;
  const approvalRate   = totalProcessed ? Math.round((approved/totalProcessed)*100) : 0;

  // Team reviewer workload (head view)
  const reviewerWorkload = {};
  deviations.forEach(d => { reviewerWorkload[d.reviewer] = reviewerWorkload[d.reviewer] || { total:0, pending:0, reviewed:0 }; reviewerWorkload[d.reviewer].total++; if(d.status==="Pending Review") reviewerWorkload[d.reviewer].pending++; if(d.status==="Reviewed") reviewerWorkload[d.reviewer].reviewed++; });
  const workloadRows = Object.entries(reviewerWorkload).map(([name, v]) => ({ name, ...v, pct: Math.round((v.reviewed/v.total)*100) })).sort((a,b)=>b.total-a.total);

  // Branch breakdown (head)
  const branchCounts = {};
  deviations.forEach(d => { branchCounts[d.branch] = (branchCounts[d.branch]||0)+1; });
  const branchRows = Object.entries(branchCounts).map(([k,v])=>({label:k,value:v})).sort((a,b)=>b.value-a.value);

  // Recent activity
  const recentActivity = isReviewer ? [
    { icon:"⚠️", text:"DV-10241 flagged — Rule 31 Duplicate contract",             time:"Today, 09:14 AM", color:"#FFF3CD", border:"#FBBF24" },
    { icon:"✓",  text:"DV-10236 submitted for approval",                           time:"Yesterday, 04:30 PM", color:"#D4EDDA", border:"#28A745" },
    { icon:"👁", text:"DV-10235 opened for review",                                time:"Yesterday, 02:15 PM", color:"#CCE5FF", border:"#3A86FF" },
    { icon:"⚠️", text:"DV-10237 escalated — Rule 11 DPD mismatch",                time:"15 Jan, 11:00 AM", color:"#F8D7DA", border:"#DC3545" },
    { icon:"✓",  text:"DV-10240 submitted for approval",                           time:"14 Jan, 04:22 PM", color:"#D4EDDA", border:"#28A745" },
  ] : [
    { icon:"⏳", text:"DV-10241 submitted by Priya Menon — awaiting your approval", time:"Today, 02:55 PM",   color:"#FFF3CD", border:"#FBBF24" },
    { icon:"✓",  text:"DV-10231 approved — NPA date mapping verified",              time:"Yesterday, 10:40 AM", color:"#D4EDDA", border:"#28A745" },
    { icon:"↩",  text:"DV-10233 sent back to Suresh K for correction",              time:"13 Jan, 04:58 PM",  color:"#FEF3C7", border:"#F59E0B" },
    { icon:"✗",  text:"DV-10232 rejected — insufficient justification",             time:"12 Jan, 09:05 AM",  color:"#F8D7DA", border:"#DC3545" },
    { icon:"✓",  text:"DV-10230 approved — source data validated",                  time:"10 Jan, 03:15 PM",  color:"#D4EDDA", border:"#28A745" },
  ];

  const StatCard = ({ label, value, accent, bg, sub, onClick, clickLabel }) => (
    <div style={{ background:bg||"#fff", borderRadius:14, padding:"20px 22px", borderLeft:`4px solid ${accent}`, boxShadow:"0 1px 6px rgba(0,0,0,0.07)", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
      <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:36, fontWeight:900, color:"#0A2342", lineHeight:1, marginBottom:sub?6:0 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:"#94A3B8" }}>{sub}</div>}
      {onClick && <button onClick={onClick} style={{ marginTop:10, background:"transparent", border:`1px solid ${accent}`, color:accent, borderRadius:7, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", alignSelf:"flex-start" }}>{clickLabel} →</button>}
    </div>
  );

  const SectionTitle = ({ children }) => (
    <div style={{ fontSize:15, fontWeight:800, color:"#0A2342", marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>{children}</div>
  );

  const card = (content) => (
    <div style={{ background:"#fff", borderRadius:14, padding:22, boxShadow:"0 1px 6px rgba(0,0,0,0.07)" }}>{content}</div>
  );

  // ── Progress ring helper ──────────────────────────────────────
  const Ring = ({ pct, color, size=64 }) => {
    const r = (size-8)/2, circ = 2*Math.PI*r, dash = (pct/100)*circ;
    return (
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
    );
  };

  // ── Bar helper ────────────────────────────────────────────────
  const Bar = ({ value, max, color }) => (
    <div style={{ flex:1, height:8, background:"#F1F5F9", borderRadius:4, overflow:"hidden" }}>
      <div style={{ width:`${Math.round((value/max)*100)}%`, height:"100%", background:color, borderRadius:4, transition:"width 0.4s" }} />
    </div>
  );

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>

      {/* Welcome header */}
      <div style={{ marginBottom:26 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:"#0A2342", letterSpacing:-0.5 }}>
              {isReviewer ? "Good morning, Priya 👋" : "Good morning, Ramesh 👋"}
            </h1>
            <p style={{ margin:"5px 0 0", color:"#64748B", fontSize:13 }}>
              {isReviewer
                ? `FY 2024–25 · RBI LR Cycle · Chennai - Central · ${myPending.length} deviations need your attention today`
                : `FY 2024–25 · RBI LR Cycle · Chennai Region · ${totalPending} submissions awaiting your approval`}
            </p>
          </div>
          <div style={{ background:"#fff", borderRadius:12, padding:"10px 18px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>📅</span>
            <div>
              <div style={{ fontSize:12, color:"#94A3B8", fontWeight:600 }}>Cycle Deadline</div>
              <div style={{ fontSize:14, fontWeight:800, color:"#DC3545" }}>31 Jan 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWER DASHBOARD ── */}
      {isReviewer && (
        <>
          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
            <StatCard label="My Total Deviations" value={myDeviations.length}  accent="#2563EB" bg="#fff"    sub="Assigned to you this cycle" onClick={()=>navigate("list")} clickLabel="View All" />
            <StatCard label="Pending Review"       value={myPending.length}    accent="#F0AD4E" bg="#FFFBEB" sub="Action required"            onClick={()=>navigate("list")} clickLabel="Start Review" />
            <StatCard label="Reviewed"             value={myReviewed.length}   accent="#28A745" bg="#F0FDF4" sub="Submitted for approval" />
            <StatCard label="Escalated"            value={myEscalated.length}  accent="#DC3545" bg="#FFF5F5" sub="Needs urgent attention" />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

            {/* Completion progress */}
            {card(
              <>
                <SectionTitle>📊 My Review Progress</SectionTitle>
                <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:20 }}>
                  <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                    <Ring pct={completionPct} color="#2563EB" size={96} />
                    <div style={{ position:"absolute", textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:900, color:"#0A2342" }}>{completionPct}%</div>
                      <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>Done</div>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    {[
                      { label:"Pending Review", count:myPending.length,   color:"#F0AD4E" },
                      { label:"Under Review",   count:myUnder.length,     color:"#3A86FF" },
                      { label:"Reviewed",       count:myReviewed.length,  color:"#28A745" },
                      { label:"Escalated",      count:myEscalated.length, color:"#DC3545" },
                    ].map(s=>(
                      <div key={s.label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:"#64748B", flex:1 }}>{s.label}</span>
                        <Bar value={s.count} max={myDeviations.length} color={s.color} />
                        <span style={{ fontSize:12, fontWeight:700, color:"#0A2342", width:18, textAlign:"right" }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>navigate("list")} style={{ width:"100%", background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:9, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  📋 Go to Deviation List →
                </button>
              </>
            )}

            {/* Rule breakdown */}
            {card(
              <>
                <SectionTitle>📖 Deviations by Rule</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {ruleBreakdown.map((r,i)=>(
                    <div key={r.id} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:11, fontWeight:800, padding:"3px 8px", borderRadius:6, whiteSpace:"nowrap" }}>Rule {r.id}</span>
                      <span style={{ fontSize:12, color:"#64748B", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.desc}</span>
                      <Bar value={r.count} max={deviations.length} color={productColors[i % productColors.length]} />
                      <span style={{ fontSize:12, fontWeight:800, color:"#0A2342", width:18, textAlign:"right" }}>{r.count}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate("rules")} style={{ marginTop:16, width:"100%", background:"#F8FAFC", color:"#0A2342", border:"1.5px solid #E2E8F0", borderRadius:9, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  📖 View Rules Master List →
                </button>
              </>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

            {/* Product breakdown */}
            {card(
              <>
                <SectionTitle>🚗 Deviations by Product</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {productBreakdown.map((p,i)=>(
                    <div key={p.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:productColors[i], flexShrink:0 }} />
                      <span style={{ fontSize:13, color:"#334155", flex:1 }}>{p.label}</span>
                      <Bar value={p.value} max={deviations.length} color={productColors[i]} />
                      <span style={{ fontSize:12, fontWeight:800, color:"#0A2342", width:18, textAlign:"right" }}>{p.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent activity */}
            {card(
              <>
                <SectionTitle>🕑 Recent Activity</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {recentActivity.map((a,i)=>(
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:14, position:"relative" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:a.color, border:`1.5px solid ${a.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{a.icon}</div>
                        {i < recentActivity.length-1 && <div style={{ width:2, flex:1, background:"#E2E8F0", marginTop:3 }} />}
                      </div>
                      <div style={{ paddingTop:5 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#334155", lineHeight:1.4 }}>{a.text}</div>
                        <div style={{ fontSize:11, color:"#94A3B8", marginTop:3 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── ORG UNIT HEAD DASHBOARD ── */}
      {!isReviewer && (
        <>
          {/* KPI row */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
            <StatCard label="Pending Approvals"  value={totalPending}    accent="#F0AD4E" bg="#FFFBEB" sub={`${highPriority} high priority`}    onClick={()=>navigate("approval")} clickLabel="Review Now" />
            <StatCard label="Approved This Cycle" value={approved}        accent="#28A745" bg="#F0FDF4" sub="Out of 7 processed" />
            <StatCard label="Approval Rate"       value={`${approvalRate}%`} accent="#2563EB" bg="#fff"    sub="This RBI cycle" />
            <StatCard label="Sent Back / Rejected" value={sentBack+rejected} accent="#DC3545" bg="#FFF5F5" sub={`${sentBack} sent back · ${rejected} rejected`} />
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>

            {/* Approval funnel */}
            {card(
              <>
                <SectionTitle>✅ Approval Overview</SectionTitle>
                <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:20 }}>
                  <div style={{ position:"relative", display:"inline-flex", alignItems:"center", justifyContent:"center" }}>
                    <Ring pct={approvalRate} color="#28A745" size={96} />
                    <div style={{ position:"absolute", textAlign:"center" }}>
                      <div style={{ fontSize:20, fontWeight:900, color:"#0A2342" }}>{approvalRate}%</div>
                      <div style={{ fontSize:10, color:"#94A3B8", fontWeight:600 }}>Approved</div>
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    {[
                      { label:"Pending",   count:totalPending, color:"#F0AD4E" },
                      { label:"Approved",  count:approved,     color:"#28A745" },
                      { label:"Sent Back", count:sentBack,     color:"#F59E0B" },
                      { label:"Rejected",  count:rejected,     color:"#DC3545" },
                    ].map(s=>(
                      <div key={s.label} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
                        <span style={{ fontSize:12, color:"#64748B", flex:1 }}>{s.label}</span>
                        <Bar value={s.count} max={totalPending+totalProcessed} color={s.color} />
                        <span style={{ fontSize:12, fontWeight:700, color:"#0A2342", width:18, textAlign:"right" }}>{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>navigate("approval")} style={{ width:"100%", background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:9, padding:"11px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  ⏳ Go to Pending Approvals →
                </button>
              </>
            )}

            {/* Pending by priority */}
            {card(
              <>
                <SectionTitle>🚨 Pending by Priority</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                  {pendingApprovals.map(d=>(
                    <div key={d.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", background:"#F8FAFC", borderRadius:9, border:"1px solid #E2E8F0" }}>
                      <PriorityBadge p={d.priority} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#0A2342" }}>{d.id}</div>
                        <div style={{ fontSize:11, color:"#94A3B8", fontFamily:"monospace" }}>{d.contractNo}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, color:"#64748B" }}>{d.product}</div>
                        <div style={{ fontSize:11, color:"#94A3B8" }}>by {d.reviewer}</div>
                      </div>
                      <button onClick={()=>navigate("approval")} style={{ background:"#0A2342", color:"#fff", border:"none", borderRadius:7, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Review</button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate("history")} style={{ width:"100%", background:"#F8FAFC", color:"#0A2342", border:"1.5px solid #E2E8F0", borderRadius:9, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  🕑 View Approval History →
                </button>
              </>
            )}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>

            {/* Team workload */}
            {card(
              <>
                <SectionTitle>👥 Reviewer Workload</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {workloadRows.map(r=>(
                    <div key={r.name} style={{ padding:"11px 14px", background:"#F8FAFC", borderRadius:9, border:"1px solid #E2E8F0" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#2563EB,#06B6D4)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:11 }}>{r.name.charAt(0)}</div>
                          <span style={{ fontSize:13, fontWeight:600, color:"#334155" }}>{r.name}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:800, color:"#0A2342" }}>{r.pct}% done</span>
                      </div>
                      <div style={{ display:"flex", gap:4, height:6 }}>
                        <div style={{ width:`${Math.round((r.reviewed/r.total)*100)}%`, background:"#28A745", borderRadius:"3px 0 0 3px" }} />
                        <div style={{ width:`${Math.round((r.pending/r.total)*100)}%`, background:"#F0AD4E" }} />
                        <div style={{ flex:1, background:"#E2E8F0", borderRadius:"0 3px 3px 0" }} />
                      </div>
                      <div style={{ display:"flex", gap:12, marginTop:5 }}>
                        <span style={{ fontSize:11, color:"#28A745", fontWeight:600 }}>{r.reviewed} reviewed</span>
                        <span style={{ fontSize:11, color:"#F0AD4E", fontWeight:600 }}>{r.pending} pending</span>
                        <span style={{ fontSize:11, color:"#94A3B8" }}>{r.total} total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent activity */}
            {card(
              <>
                <SectionTitle>🕑 Recent Activity</SectionTitle>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {recentActivity.map((a,i)=>(
                    <div key={i} style={{ display:"flex", gap:12, paddingBottom:14, position:"relative" }}>
                      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:a.color, border:`1.5px solid ${a.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{a.icon}</div>
                        {i < recentActivity.length-1 && <div style={{ width:2, flex:1, background:"#E2E8F0", marginTop:3 }} />}
                      </div>
                      <div style={{ paddingTop:5 }}>
                        <div style={{ fontSize:12, fontWeight:600, color:"#334155", lineHeight:1.4 }}>{a.text}</div>
                        <div style={{ fontSize:11, color:"#94A3B8", marginTop:3 }}>{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 8 — USER MANAGEMENT (ADMIN)
// ══════════════════════════════════════════════════════════════════
const usersData = [
  { id:"USR-001", name:"Priya Menon",     email:"priya.menon@hfl.in",    role:"Reviewer",      orgUnit:"Chennai - Central", status:"Active",   lastLogin:"16 Jan 2025, 02:14 PM", createdOn:"01 Apr 2024", deviationsReviewed:34, pendingCount:3,  initial:"P", color:"#1D4ED8" },
  { id:"USR-002", name:"Ramesh Chandran", email:"ramesh.c@hfl.in",       role:"Org Unit Head", orgUnit:"Chennai - Central", status:"Active",   lastLogin:"16 Jan 2025, 04:45 PM", createdOn:"01 Apr 2024", deviationsReviewed:0,  pendingCount:3,  initial:"R", color:"#7C3AED" },
  { id:"USR-003", name:"Arjun Rajan",     email:"arjun.r@hfl.in",        role:"Reviewer",      orgUnit:"Coimbatore",        status:"Active",   lastLogin:"15 Jan 2025, 11:20 AM", createdOn:"12 May 2024", deviationsReviewed:21, pendingCount:1,  initial:"A", color:"#0891B2" },
  { id:"USR-004", name:"Kavitha S",       email:"kavitha.s@hfl.in",      role:"Reviewer",      orgUnit:"Chennai - Central", status:"Active",   lastLogin:"14 Jan 2025, 09:55 AM", createdOn:"12 May 2024", deviationsReviewed:18, pendingCount:0,  initial:"K", color:"#059669" },
  { id:"USR-005", name:"Nirmala T",       email:"nirmala.t@hfl.in",      role:"Org Unit Head", orgUnit:"Chennai - North",   status:"Active",   lastLogin:"15 Jan 2025, 03:30 PM", createdOn:"01 Apr 2024", deviationsReviewed:0,  pendingCount:2,  initial:"N", color:"#D97706" },
  { id:"USR-006", name:"Suresh K",        email:"suresh.k@hfl.in",       role:"Reviewer",      orgUnit:"Tiruppur",          status:"Active",   lastLogin:"13 Jan 2025, 04:10 PM", createdOn:"20 Jun 2024", deviationsReviewed:12, pendingCount:2,  initial:"S", color:"#DC2626" },
  { id:"USR-007", name:"Mohan R",         email:"mohan.r@hfl.in",        role:"Reviewer",      orgUnit:"Salem",             status:"Active",   lastLogin:"12 Jan 2025, 10:40 AM", createdOn:"20 Jun 2024", deviationsReviewed:9,  pendingCount:1,  initial:"M", color:"#7C3AED" },
  { id:"USR-008", name:"Deepa V",         email:"deepa.v@hfl.in",        role:"Reviewer",      orgUnit:"Trichy",            status:"Active",   lastLogin:"11 Jan 2025, 02:25 PM", createdOn:"01 Jul 2024", deviationsReviewed:14, pendingCount:0,  initial:"D", color:"#0891B2" },
  { id:"USR-009", name:"Selvam K",        email:"selvam.k@hfl.in",       role:"Org Unit Head", orgUnit:"Madurai",           status:"Inactive", lastLogin:"02 Jan 2025, 09:00 AM", createdOn:"01 Apr 2024", deviationsReviewed:0,  pendingCount:0,  initial:"S", color:"#475569" },
  { id:"USR-010", name:"Venkat R",        email:"venkat.r@hfl.in",       role:"Org Unit Head", orgUnit:"Coimbatore",        status:"Active",   lastLogin:"16 Jan 2025, 01:00 PM", createdOn:"01 Apr 2024", deviationsReviewed:0,  pendingCount:4,  initial:"V", color:"#1D4ED8" },
  { id:"USR-011", name:"Babu M",          email:"babu.m@hfl.in",         role:"Org Unit Head", orgUnit:"Trichy",            status:"Active",   lastLogin:"10 Jan 2025, 11:15 AM", createdOn:"15 Aug 2024", deviationsReviewed:0,  pendingCount:1,  initial:"B", color:"#059669" },
  { id:"USR-012", name:"Suresh Iyer",     email:"suresh.iyer@hfl.in",    role:"Admin",         orgUnit:"Head Office",       status:"Active",   lastLogin:"16 Jan 2025, 05:00 PM", createdOn:"01 Jan 2024", deviationsReviewed:0,  pendingCount:0,  initial:"S", color:"#0A2342" },
];

const roleColors = {
  "Reviewer":      { bg:"#EFF6FF", text:"#1D4ED8" },
  "Org Unit Head": { bg:"#F5F3FF", text:"#6D28D9" },
  "Admin":         { bg:"#FFF7ED", text:"#C2410C" },
};

function UserManagement() {
  const [search, setSearch]             = useState("");
  const [filterRole, setFilterRole]     = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOU, setFilterOU]         = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode]         = useState(false);
  const [editData, setEditData]         = useState(null);
  const [saved, setSaved]               = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const orgUnits = ["All", ...Array.from(new Set(usersData.map(u => u.orgUnit)))];

  const filtered = usersData.filter(u => {
    const ms  = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
    const mr  = filterRole   === "All" || u.role   === filterRole;
    const mst = filterStatus === "All" || u.status === filterStatus;
    const mo  = filterOU     === "All" || u.orgUnit === filterOU;
    return ms && mr && mst && mo;
  });

  const counts = {
    total:    usersData.length,
    active:   usersData.filter(u => u.status === "Active").length,
    reviewers:usersData.filter(u => u.role === "Reviewer").length,
    heads:    usersData.filter(u => u.role === "Org Unit Head").length,
  };

  const startEdit  = () => { setEditData(JSON.parse(JSON.stringify(selectedUser))); setEditMode(true); setSaved(false); };
  const cancelEdit = () => { setEditMode(false); setEditData(null); };
  const saveEdit   = () => { setEditMode(false); setSaved(true); setEditData(null); setTimeout(() => setSaved(false), 3000); };
  const current    = editMode ? editData : selectedUser;

  const sectionHead = (t) => <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.9, marginBottom:12 }}>{t}</div>;

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>User Management</h1>
          <p style={{ margin:"4px 0 0", color:"#64748B", fontSize:13 }}>Manage portal users, roles, org unit assignments and account status.</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          style={{ background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:9, padding:"10px 22px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8 }}>
          + Add User
        </button>
      </div>

      {/* Add User banner (mock) */}
      {showAddModal && (
        <div style={{ background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:12, padding:"16px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>➕</span>
          <span style={{ fontSize:13, color:"#1E40AF", fontWeight:500 }}>Add User form would open as a modal or slide-over panel in production. This is a presales demo — interaction shown here is illustrative.</span>
          <button onClick={() => setShowAddModal(false)} style={{ marginLeft:"auto", background:"none", border:"none", color:"#64748B", cursor:"pointer", fontSize:20 }}>×</button>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
        {[
          { label:"Total Users",    value:counts.total,     accent:"#2563EB", bg:"#fff"    },
          { label:"Active",         value:counts.active,    accent:"#28A745", bg:"#F0FDF4" },
          { label:"Reviewers",      value:counts.reviewers, accent:"#F0AD4E", bg:"#FFFBEB" },
          { label:"Org Unit Heads", value:counts.heads,     accent:"#7C3AED", bg:"#F5F3FF" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{c.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:"#0A2342", lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:20, alignItems:"start" }}>

        {/* User Table */}
        <div>
          {/* Filters */}
          <div style={{ background:"#fff", borderRadius:12, padding:"13px 18px", marginBottom:14, display:"flex", gap:14, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200, position:"relative" }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email or ID..."
                style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
            </div>
            {[
              { label:"Role:",   value:filterRole,   set:setFilterRole,   opts:["All","Reviewer","Org Unit Head","Admin"] },
              { label:"Status:", value:filterStatus, set:setFilterStatus, opts:["All","Active","Inactive"] },
              { label:"Unit:",   value:filterOU,     set:setFilterOU,     opts:orgUnits },
            ].map(f => (
              <div key={f.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{f.label}</span>
                <select value={f.value} onChange={e=>f.set(e.target.value)} style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <span style={{ fontSize:13, color:"#64748B", marginLeft:"auto" }}>{filtered.length} users</span>
          </div>

          <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
                  {["User","Email","Role","Org Unit","Status","Last Login",""].map(h => (
                    <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const rc = roleColors[u.role] || { bg:"#F1F5F9", text:"#475569" };
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <tr key={u.id} onClick={() => { setSelectedUser(u); setEditMode(false); setEditData(null); setSaved(false); }}
                      style={{ borderBottom:"1px solid #F1F5F9", background: isSelected ? "#EFF6FF" : i%2===0 ? "#fff" : "#FAFBFC", cursor:"pointer", borderLeft: isSelected ? "3px solid #2563EB" : "3px solid transparent" }}
                      onMouseEnter={e=>{ if(!isSelected) e.currentTarget.style.background="#EFF6FF"; }}
                      onMouseLeave={e=>{ if(!isSelected) e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"; }}>
                      <td style={{ padding:"12px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,${u.color},${u.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:13, flexShrink:0 }}>{u.initial}</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:"#0A2342" }}>{u.name}</div>
                            <div style={{ fontSize:11, color:"#94A3B8" }}>{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#64748B" }}>{u.email}</td>
                      <td style={{ padding:"12px 14px" }}><span style={{ background:rc.bg, color:rc.text, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>{u.role}</span></td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#334155" }}>{u.orgUnit}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:u.status==="Active"?"#D4EDDA":"#F8D7DA", color:u.status==="Active"?"#155724":"#721C24", fontSize:12, fontWeight:600, padding:"3px 10px", borderRadius:20 }}>
                          <span style={{ width:6, height:6, borderRadius:"50%", background:u.status==="Active"?"#28A745":"#DC3545", display:"inline-block" }} />{u.status}
                        </span>
                      </td>
                      <td style={{ padding:"12px 14px", fontSize:12, color:"#64748B" }}>{u.lastLogin}</td>
                      <td style={{ padding:"12px 14px" }}>
                        <button onClick={e=>{ e.stopPropagation(); setSelectedUser(u); setEditMode(false); setEditData(null); setSaved(false); }}
                          style={{ background:"#EFF6FF", color:"#1D4ED8", border:"none", borderRadius:7, padding:"6px 12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>View →</button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length===0 && <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No users match the current filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Panel */}
        {!selectedUser ? (
          <div style={{ background:"#fff", borderRadius:12, padding:32, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>👤</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#64748B" }}>Select a user to view details</div>
            <div style={{ fontSize:13, color:"#94A3B8", marginTop:6 }}>Click any row on the left</div>
          </div>
        ) : (
          <div style={{ background:"#fff", borderRadius:12, boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflow:"hidden" }}>
            {/* User card header */}
            <div style={{ background:"linear-gradient(135deg,#0A2342,#1D4ED8)", padding:"22px 20px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${current.color},${current.color}99)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:900, fontSize:20, border:"3px solid rgba(255,255,255,0.3)", flexShrink:0 }}>{current.initial}</div>
              <div>
                <div style={{ color:"#fff", fontWeight:800, fontSize:17 }}>{current.name}</div>
                <div style={{ color:"#93C5FD", fontSize:12, marginTop:2 }}>{current.email}</div>
                <div style={{ marginTop:5 }}><span style={{ background:"rgba(255,255,255,0.15)", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>{current.role}</span></div>
              </div>
            </div>

            <div style={{ padding:18 }}>
              {saved && !editMode && <div style={{ background:"#D4EDDA", color:"#155724", fontSize:12, fontWeight:700, padding:"8px 14px", borderRadius:8, marginBottom:14 }}>✓ Changes saved successfully</div>}

              {sectionHead("Account Details")}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[
                  ["User ID",      current.id],
                  ["Org Unit",     current.orgUnit],
                  ["Created On",   current.createdOn],
                  ["Last Login",   current.lastLogin],
                ].map(([l,v]) => (
                  <div key={l} style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:11, color:"#94A3B8", fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:13, color:"#0A2342", fontWeight:600 }}>{v}</div>
                  </div>
                ))}
              </div>

              {sectionHead("Activity Summary")}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <div style={{ background:"#EFF6FF", borderRadius:8, padding:"10px 12px", border:"1px solid #BFDBFE" }}>
                  <div style={{ fontSize:11, color:"#64748B", fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>Reviewed</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#1D4ED8" }}>{current.deviationsReviewed}</div>
                </div>
                <div style={{ background:"#FFFBEB", borderRadius:8, padding:"10px 12px", border:"1px solid #FDE68A" }}>
                  <div style={{ fontSize:11, color:"#64748B", fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>Pending</div>
                  <div style={{ fontSize:22, fontWeight:800, color:"#D97706" }}>{current.pendingCount}</div>
                </div>
              </div>

              {/* Role & Status edit */}
              {sectionHead("Role & Status")}
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
                <div>
                  <div style={{ fontSize:12, color:"#64748B", fontWeight:600, marginBottom:5 }}>Role</div>
                  {editMode
                    ? <select value={editData.role} onChange={e=>setEditData(p=>({...p,role:e.target.value}))} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #2563EB", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
                        {["Reviewer","Org Unit Head","Admin"].map(r=><option key={r}>{r}</option>)}
                      </select>
                    : <span style={{ background:roleColors[current.role]?.bg, color:roleColors[current.role]?.text, fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:20 }}>{current.role}</span>
                  }
                </div>
                <div>
                  <div style={{ fontSize:12, color:"#64748B", fontWeight:600, marginBottom:5 }}>Status</div>
                  {editMode
                    ? <select value={editData.status} onChange={e=>setEditData(p=>({...p,status:e.target.value}))} style={{ width:"100%", padding:"9px 12px", borderRadius:8, border:"1.5px solid #2563EB", fontSize:13, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
                        {["Active","Inactive"].map(s=><option key={s}>{s}</option>)}
                      </select>
                    : <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:current.status==="Active"?"#D4EDDA":"#F8D7DA", color:current.status==="Active"?"#155724":"#721C24", fontSize:12, fontWeight:600, padding:"4px 12px", borderRadius:20 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:current.status==="Active"?"#28A745":"#DC3545", display:"inline-block" }} />{current.status}
                      </span>
                  }
                </div>
              </div>

              {/* Actions */}
              {!editMode
                ? <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <button onClick={startEdit} style={{ background:"linear-gradient(135deg,#0A2342,#2563EB)", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✏️ Edit User</button>
                    <button style={{ background:"#FFF5F5", color:"#991B1B", border:"1px solid #FECACA", borderRadius:8, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>🔒 Reset Password</button>
                    {current.status === "Active"
                      ? <button style={{ background:"#F8FAFC", color:"#64748B", border:"1.5px solid #E2E8F0", borderRadius:8, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Deactivate Account</button>
                      : <button style={{ background:"#F0FDF4", color:"#15803D", border:"1px solid #BBF7D0", borderRadius:8, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Reactivate Account</button>
                    }
                  </div>
                : <div style={{ display:"flex", gap:8 }}>
                    <button onClick={cancelEdit} style={{ flex:1, background:"#F8FAFC", color:"#64748B", border:"1.5px solid #E2E8F0", borderRadius:8, padding:"10px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Cancel</button>
                    <button onClick={saveEdit}   style={{ flex:1, background:"linear-gradient(135deg,#15803D,#22C55E)", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>✓ Save</button>
                  </div>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 9 — AUDIT TRAIL (ADMIN)
// ══════════════════════════════════════════════════════════════════
const auditData = [
  { id:"AUD-0201", ts:"16 Jan 2025, 05:00 PM", user:"Suresh Iyer",     role:"Admin",         action:"Login",              entity:"System",     entityId:"—",        detail:"Admin login from IP 103.21.44.12",                                         category:"Auth"       },
  { id:"AUD-0200", ts:"16 Jan 2025, 04:52 PM", user:"Suresh Iyer",     role:"Admin",         action:"Permission Updated", entity:"Org Unit",   entityId:"OU-03",    detail:"Export Data permission enabled for Coimbatore",                            category:"Config"     },
  { id:"AUD-0199", ts:"16 Jan 2025, 04:45 PM", user:"Ramesh Chandran", role:"Org Unit Head", action:"Approved",           entity:"Deviation",  entityId:"DV-10234", detail:"DV-10234 approved. OD correction validated against CBS.",                  category:"Approval"   },
  { id:"AUD-0198", ts:"16 Jan 2025, 04:30 PM", user:"Priya Menon",     role:"Reviewer",      action:"Submitted",          entity:"Deviation",  entityId:"DV-10234", detail:"DV-10234 submitted for approval after data correction.",                   category:"Review"     },
  { id:"AUD-0197", ts:"16 Jan 2025, 04:22 PM", user:"Priya Menon",     role:"Reviewer",      action:"Edited",             entity:"Deviation",  entityId:"DV-10234", detail:"Flag changed T→R, OD updated from 3,45,000 to 3,21,450.",                 category:"Review"     },
  { id:"AUD-0196", ts:"16 Jan 2025, 02:55 PM", user:"Priya Menon",     role:"Reviewer",      action:"Submitted",          entity:"Deviation",  entityId:"DV-10241", detail:"DV-10241 escalated to Head Office. Duplicate contract unresolved.",        category:"Review"     },
  { id:"AUD-0195", ts:"16 Jan 2025, 02:14 PM", user:"Priya Menon",     role:"Reviewer",      action:"Login",              entity:"System",     entityId:"—",        detail:"Reviewer login from IP 106.51.22.88",                                      category:"Auth"       },
  { id:"AUD-0194", ts:"16 Jan 2025, 01:00 PM", user:"Venkat R",        role:"Org Unit Head", action:"Login",              entity:"System",     entityId:"—",        detail:"Org Unit Head login from IP 49.204.11.32",                                 category:"Auth"       },
  { id:"AUD-0193", ts:"15 Jan 2025, 11:20 AM", user:"Nirmala T",       role:"Org Unit Head", action:"Approved",           entity:"Deviation",  entityId:"DV-10238", detail:"DV-10238 approved. OTR deviation acceptable per RBI norms.",               category:"Approval"   },
  { id:"AUD-0192", ts:"15 Jan 2025, 11:10 AM", user:"Nirmala T",       role:"Org Unit Head", action:"Login",              entity:"System",     entityId:"—",        detail:"Org Unit Head login from IP 122.166.88.21",                                category:"Auth"       },
  { id:"AUD-0191", ts:"14 Jan 2025, 09:55 AM", user:"Kavitha S",       role:"Reviewer",      action:"Login",              entity:"System",     entityId:"—",        detail:"Reviewer login from IP 103.21.44.99",                                      category:"Auth"       },
  { id:"AUD-0190", ts:"13 Jan 2025, 04:58 PM", user:"Ramesh Chandran", role:"Org Unit Head", action:"Sent Back",          entity:"Deviation",  entityId:"DV-10233", detail:"DV-10233 sent back. DPD mismatch with CBS — reviewer to recheck.",        category:"Approval"   },
  { id:"AUD-0189", ts:"13 Jan 2025, 04:10 PM", user:"Suresh K",        role:"Reviewer",      action:"Login",              entity:"System",     entityId:"—",        detail:"Reviewer login from IP 117.55.33.10",                                      category:"Auth"       },
  { id:"AUD-0188", ts:"12 Jan 2025, 09:05 AM", user:"Ramesh Chandran", role:"Org Unit Head", action:"Rejected",           entity:"Deviation",  entityId:"DV-10232", detail:"DV-10232 rejected. Insufficient justification for accepting deviation.",   category:"Approval"   },
  { id:"AUD-0187", ts:"11 Jan 2025, 10:40 AM", user:"Ramesh Chandran", role:"Org Unit Head", action:"Approved",           entity:"Deviation",  entityId:"DV-10231", detail:"DV-10231 approved. NPA date mapping verified with CBS.",                   category:"Approval"   },
  { id:"AUD-0186", ts:"10 Jan 2025, 03:15 PM", user:"Ramesh Chandran", role:"Org Unit Head", action:"Approved",           entity:"Deviation",  entityId:"DV-10230", detail:"DV-10230 approved. Correction validated against source data.",             category:"Approval"   },
  { id:"AUD-0185", ts:"09 Jan 2025, 02:30 PM", user:"Suresh Iyer",     role:"Admin",         action:"User Created",       entity:"User",       entityId:"USR-011",  detail:"New user Babu M created as Org Unit Head for Trichy.",                     category:"User Mgmt"  },
  { id:"AUD-0184", ts:"08 Jan 2025, 11:00 AM", user:"Suresh Iyer",     role:"Admin",         action:"Rule Access Updated",entity:"Org Unit",   entityId:"OU-05",    detail:"Rule 27 and Rule 31 added to Tiruppur rule access.",                       category:"Config"     },
];

const auditCategoryColors = {
  "Auth":      { bg:"#EFF6FF", text:"#1D4ED8" },
  "Review":    { bg:"#FEF9C3", text:"#713F12" },
  "Approval":  { bg:"#D1FAE5", text:"#065F46" },
  "Config":    { bg:"#F5F3FF", text:"#6D28D9" },
  "User Mgmt": { bg:"#FFF7ED", text:"#C2410C" },
};

const auditActionColors = {
  "Login":              { bg:"#EFF6FF", text:"#1D4ED8" },
  "Approved":           { bg:"#D1FAE5", text:"#065F46" },
  "Rejected":           { bg:"#FEE2E2", text:"#991B1B" },
  "Sent Back":          { bg:"#FEF3C7", text:"#78350F" },
  "Submitted":          { bg:"#FFF3CD", text:"#856404" },
  "Edited":             { bg:"#F5F3FF", text:"#6D28D9" },
  "Permission Updated": { bg:"#ECFEFF", text:"#0E7490" },
  "User Created":       { bg:"#FFF7ED", text:"#C2410C" },
  "Rule Access Updated":{ bg:"#F0FDF4", text:"#15803D" },
};

function AuditTrail() {
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("All");
  const [filterRole, setFilterRole]     = useState("All");
  const [filterAction, setFilterAction] = useState("All");
  const [expanded, setExpanded]         = useState(null);
  const [dateFrom, setDateFrom]         = useState("");

  const categories = ["All", ...Array.from(new Set(auditData.map(a => a.category)))];
  const actions    = ["All", ...Array.from(new Set(auditData.map(a => a.action)))];

  const filtered = auditData.filter(a => {
    const ms  = a.user.toLowerCase().includes(search.toLowerCase()) || a.detail.toLowerCase().includes(search.toLowerCase()) || a.entityId.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase());
    const mc  = filterCat    === "All" || a.category === filterCat;
    const mr  = filterRole   === "All" || a.role     === filterRole;
    const ma  = filterAction === "All" || a.action   === filterAction;
    return ms && mc && mr && ma;
  });

  const counts = {
    total:    auditData.length,
    approvals:auditData.filter(a => a.category === "Approval").length,
    reviews:  auditData.filter(a => a.category === "Review").length,
    config:   auditData.filter(a => ["Config","User Mgmt"].includes(a.category)).length,
  };

  return (
    <div style={{ minHeight:"calc(100vh - 95px)", background:"#F0F2F7", fontFamily:"'DM Sans',sans-serif", padding:"28px 32px" }}>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0A2342", letterSpacing:-0.5 }}>Audit Trail</h1>
        <p style={{ margin:"4px 0 0", color:"#64748B", fontSize:13 }}>Complete immutable log of all user actions, system events, and configuration changes across the portal.</p>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:22 }}>
        {[
          { label:"Total Events",    value:counts.total,     accent:"#2563EB", bg:"#fff"    },
          { label:"Approval Events", value:counts.approvals, accent:"#28A745", bg:"#F0FDF4" },
          { label:"Review Events",   value:counts.reviews,   accent:"#F0AD4E", bg:"#FFFBEB" },
          { label:"Config Changes",  value:counts.config,    accent:"#7C3AED", bg:"#F5F3FF" },
        ].map(c => (
          <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"18px 20px", borderLeft:`4px solid ${c.accent}`, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ color:"#64748B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{c.label}</div>
            <div style={{ fontSize:32, fontWeight:800, color:"#0A2342", lineHeight:1 }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", borderRadius:12, padding:"13px 18px", marginBottom:16, display:"flex", gap:14, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:220, position:"relative" }}>
          <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search user, detail, entity ID..."
            style={{ width:"100%", padding:"8px 10px 8px 30px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"'DM Sans',sans-serif", color:"#0A2342" }} />
        </div>
        {[
          { label:"Category:", value:filterCat,    set:setFilterCat,    opts:categories },
          { label:"Role:",     value:filterRole,   set:setFilterRole,   opts:["All","Reviewer","Org Unit Head","Admin"] },
          { label:"Action:",   value:filterAction, set:setFilterAction, opts:actions },
        ].map(f => (
          <div key={f.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:12, color:"#64748B", fontWeight:600 }}>{f.label}</span>
            <select value={f.value} onChange={e=>f.set(e.target.value)} style={{ padding:"7px 10px", borderRadius:8, border:"1.5px solid #E2E8F0", fontSize:12, outline:"none", fontFamily:"'DM Sans',sans-serif", color:"#0A2342", background:"#fff" }}>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <span style={{ color:"#64748B", fontSize:13, marginLeft:"auto" }}>{filtered.length} events</span>
      </div>

      {/* Audit Table */}
      <div style={{ background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC", borderBottom:"2px solid #E2E8F0" }}>
              {["Event ID","Timestamp","User","Role","Action","Category","Entity",""].map(h => (
                <th key={h} style={{ padding:"11px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#64748B", textTransform:"uppercase", letterSpacing:0.7, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const cc = auditCategoryColors[a.category] || { bg:"#F1F5F9", text:"#475569" };
              const ac = auditActionColors[a.action]     || { bg:"#F1F5F9", text:"#475569" };
              const rc = roleColors[a.role]              || { bg:"#F1F5F9", text:"#475569" };
              const isExp = expanded === a.id;
              return (
                <>
                  <tr key={a.id}
                    style={{ borderBottom: isExp ? "none" : "1px solid #F1F5F9", background: isExp ? "#F0F6FF" : i%2===0 ? "#fff" : "#FAFBFC", cursor:"pointer" }}
                    onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background="#EFF6FF"; }}
                    onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background=i%2===0?"#fff":"#FAFBFC"; }}>
                    <td style={{ padding:"11px 14px", fontSize:12, color:"#2563EB", fontWeight:700, fontFamily:"monospace" }}>{a.id}</td>
                    <td style={{ padding:"11px 14px", fontSize:12, color:"#64748B", whiteSpace:"nowrap" }}>{a.ts}</td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0A2342" }}>{a.user}</div>
                    </td>
                    <td style={{ padding:"11px 14px" }}><span style={{ background:rc.bg, color:rc.text, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>{a.role}</span></td>
                    <td style={{ padding:"11px 14px" }}><span style={{ background:ac.bg, color:ac.text, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20, whiteSpace:"nowrap" }}>{a.action}</span></td>
                    <td style={{ padding:"11px 14px" }}><span style={{ background:cc.bg, color:cc.text, fontSize:11, fontWeight:700, padding:"2px 9px", borderRadius:20 }}>{a.category}</span></td>
                    <td style={{ padding:"11px 14px" }}>
                      <div style={{ fontSize:12, color:"#334155", fontWeight:600 }}>{a.entity}</div>
                      {a.entityId !== "—" && <div style={{ fontSize:11, color:"#94A3B8", fontFamily:"monospace" }}>{a.entityId}</div>}
                    </td>
                    <td style={{ padding:"11px 14px" }}>
                      <button onClick={() => setExpanded(isExp ? null : a.id)}
                        style={{ background:"#EFF6FF", color:"#1D4ED8", border:"none", borderRadius:6, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>
                        {isExp ? "▲ Hide" : "▼ Detail"}
                      </button>
                    </td>
                  </tr>
                  {isExp && (
                    <tr key={a.id+"-exp"} style={{ borderBottom:"1px solid #E2E8F0", background:"#F0F6FF" }}>
                      <td colSpan={8} style={{ padding:"0 14px 16px 48px" }}>
                        <div style={{ paddingTop:12, display:"flex", gap:32, alignItems:"flex-start" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, color:"#2563EB", fontWeight:700, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>Event Detail</div>
                            <p style={{ margin:0, fontSize:13, color:"#334155", lineHeight:1.7, background:"#fff", padding:"10px 14px", borderRadius:8, border:"1px solid #E2E8F0" }}>{a.detail}</p>
                          </div>
                          <div style={{ display:"flex", gap:24, flexShrink:0 }}>
                            {[["Event ID",a.id],["Entity",a.entity],["Entity ID",a.entityId],["Timestamp",a.ts]].map(([l,v]) => (
                              <div key={l}>
                                <div style={{ fontSize:11, color:"#94A3B8", fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>{l}</div>
                                <div style={{ fontSize:12, color:"#0A2342", fontWeight:600, fontFamily: l==="Event ID"||l==="Entity ID"?"monospace":"inherit" }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length===0 && <tr><td colSpan={8} style={{ padding:40, textAlign:"center", color:"#94A3B8", fontSize:14 }}>No audit events match the current filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop:14, textAlign:"center", fontSize:12, color:"#94A3B8" }}>
        🔒 Audit records are immutable and tamper-proof. Showing {filtered.length} of {auditData.length} total events.
      </div>
    </div>
  );
}

export default function App() {
  const [activeRole, setActiveRole]           = useState("reviewer");
  const [activePage, setActivePage]           = useState("rules");
  const [selectedDeviation, setSelectedDeviation] = useState(null);
  const [selectedRule, setSelectedRule]       = useState(null);

  const navigate                  = (page)   => setActivePage(page);
  const handleSelectDeviation     = (d)      => { setSelectedDeviation(d);  setActivePage("detail");   };
  const handleBackToList          = ()       => setActivePage("list");
  const handleViewRule            = (rule)   => { setSelectedRule(rule);    setActivePage("ruleview"); };
  const handleBackToRules         = ()       => setActivePage("rules");
  const handleRuleDeviationReview = (d)      => { setSelectedDeviation(d);  setActivePage("detail");   };

  return (
    <div>
      <GlobalNav
        activeRole={activeRole}
        setActiveRole={(r) => { setActiveRole(r); setSelectedDeviation(null); setSelectedRule(null); setActivePage(ROLES[r].tabs[0].id); }}
        activePage={activePage}
        setActivePage={setActivePage}
        selectedDeviation={selectedDeviation}
      />
      {activePage === "dashboard"  && <Dashboard activeRole={activeRole} navigate={navigate} />}
      {activePage === "rules"      && <RulesMasterList onViewRule={handleViewRule} activeRole={activeRole} />}
      {activePage === "list"       && <DeviationListView onSelectDeviation={handleSelectDeviation} />}
      {activePage === "ruleview"   && selectedRule && <RuleWiseDeviationView selectedRule={selectedRule} onSelectDeviation={handleRuleDeviationReview} onBack={handleBackToRules} />}
      {activePage === "detail"     && selectedDeviation && <DeviationDetailView deviation={selectedDeviation} onBack={handleBackToList} />}
      {activePage === "approval"   && <ApprovalDetailPage />}
      {activePage === "history"    && <ApprovalHistoryPage />}
      {activePage === "permconfig" && <OrgPermissionConfig />}
      {activePage === "usermgmt"   && <UserManagement />}
      {activePage === "audittrail" && <AuditTrail />}
    </div>
  );
}
