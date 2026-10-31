import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Hazard } from '../../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Download,
  FileSpreadsheet,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);

  useEffect(() => {
    setHazards(StorageService.getHazards());
  }, []);

  // 1. Locality Incident Density Data
  const localityMap: Record<string, number> = {};
  hazards.forEach((h) => {
    localityMap[h.locality] = (localityMap[h.locality] || 0) + 1;
  });
  const localityData = Object.entries(localityMap).map(([name, count]) => ({
    locality: name,
    incidents: count
  }));

  // 2. Category Distribution
  const categoryMap: Record<string, number> = {};
  hazards.forEach((h) => {
    const formatted = h.category.replace('_', ' ');
    categoryMap[formatted] = (categoryMap[formatted] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#D94B45', '#F28C28', '#EAB308', '#2563EB', '#7C3AED', '#16A34A', '#0D9488'];

  // 3. Reports & Confirmations Activity Trend
  const trendData = [
    { day: 'Mon', reports: 3, confirmations: 12 },
    { day: 'Tue', reports: 5, confirmations: 18 },
    { day: 'Wed', reports: 4, confirmations: 24 },
    { day: 'Thu', reports: 7, confirmations: 31 },
    { day: 'Fri', reports: 8, confirmations: 42 },
    { day: 'Sat', reports: 6, confirmations: 36 },
    { day: 'Sun', reports: hazards.length, confirmations: 54 }
  ];

  // CSV Export Function
  const handleExportCSV = () => {
    const headers = [
      'Incident_ID',
      'Title',
      'Category',
      'Severity',
      'Locality',
      'Address',
      'Latitude',
      'Longitude',
      'Confidence_Score',
      'Status',
      'Reports_Count',
      'Confirmations_Count',
      'First_Reported_At',
      'Resolved_At',
      'AI_Detected',
      'Sensor_Detected'
    ];

    const rows = hazards.map((h) => [
      h.id,
      `"${h.title.replace(/"/g, '""')}"`,
      h.category,
      h.severity,
      `"${h.locality}"`,
      `"${h.address.replace(/"/g, '""')}"`,
      h.latitude,
      h.longitude,
      h.confidenceScore,
      h.status,
      h.reportsCount,
      h.confirmationsCount,
      h.firstReportedAt,
      h.resolvedAt || 'N/A',
      h.aiDetected ? 'YES' : 'NO',
      h.sensorDetected ? 'YES' : 'NO'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `roadsense_hazard_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              Geospatial Analytics & Compliance Reporting
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Road Hazard Intelligence & Analytics
            </h1>
            <p className="text-sm text-brand-slate mt-1">
              Locality incident density, road distress morphology breakdown, and community verification trends.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto hover:scale-105"
          >
            <Download className="w-4 h-4 text-brand-orange" />
            <span>Export Incident Dataset (CSV)</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs font-bold text-brand-slate uppercase">Total Logged Incidents</span>
            <div className="text-3xl font-black text-brand-navy mt-1">{hazards.length}</div>
            <div className="text-[11px] text-brand-slate-light mt-0.5">Across 7 Bengaluru wards</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs font-bold text-brand-orange uppercase">Highest Incident Locality</span>
            <div className="text-2xl font-black text-brand-navy mt-1 truncate">Hebbal & ORR</div>
            <div className="text-[11px] text-brand-slate-light mt-0.5">Heavy two-wheeler volume</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs font-bold text-brand-slate uppercase">Photo Classified</span>
            <div className="text-3xl font-black text-brand-navy mt-1">
              {hazards.filter((h) => h.aiDetected).length}
            </div>
            <div className="text-[11px] text-brand-slate-light mt-0.5">RDD2022 Distress Tagged</div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle">
            <span className="text-xs font-bold text-emerald-700 uppercase">Resolution Ratio</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">
              {Math.round((hazards.filter((h) => h.status === 'resolved').length / (hazards.length || 1)) * 100)}%
            </div>
            <div className="text-[11px] text-brand-slate-light mt-0.5">Repaired by maintenance units</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Locality Incident Density */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-brand-orange" />
                  Locality Incident Density
                </h3>
                <p className="text-xs text-brand-slate">Active hazards by Bengaluru ward / corridor</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={localityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="locality" tick={{ fontSize: 10, fill: '#526274' }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#526274' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E9EF', fontSize: 12 }}
                  />
                  <Bar dataKey="incidents" fill="#F28C28" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Hazard Category Distribution */}
          <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  Hazard Category Breakdown
                </h3>
                <p className="text-xs text-brand-slate">Potholes, cracks, and open grates distribution</p>
              </div>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E9EF', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Weekly Activity & Confirmations Trend */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Community Verification Velocity (Last 7 Days)
                </h3>
                <p className="text-xs text-brand-slate">Rider incident reporting vs. crowd confirmations</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#526274' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#526274' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #E5E9EF', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line type="monotone" dataKey="confirmations" stroke="#7C3AED" strokeWidth={2.5} name="Community Confirmations" dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="reports" stroke="#F28C28" strokeWidth={2.5} name="New Hazard Submissions" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

