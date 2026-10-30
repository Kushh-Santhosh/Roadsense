import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { Hazard, VerificationStatus } from '../../types';
import { StatusBadge, SeverityBadge, CategoryLabel } from '../../components/HazardBadge';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitMerge,
  Eye,
  Trash2,
  RefreshCw,
  Clock
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = () => {
    setHazards(StorageService.getHazards());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredHazards = hazards.filter((h) => {
    if (statusFilter !== 'all' && h.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.locality.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredHazards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredHazards.map((h) => h.id));
    }
  };

  // Duplicate merger action
  const handleMergeDuplicates = () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 reports to merge.');
      return;
    }
    const primaryId = selectedIds[0];
    const duplicateIds = selectedIds.slice(1);

    StorageService.mergeHazards(primaryId, duplicateIds);
    setSelectedIds([]);
    loadData();
    setActionNotice(`Successfully clustered ${duplicateIds.length} duplicate reports into primary hazard ${primaryId}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Quick status change
  const handleQuickStatusChange = (hazardId: string, newStatus: VerificationStatus) => {
    StorageService.updateHazardStatus(hazardId, newStatus);
    loadData();
    setActionNotice(`Status updated to ${newStatus}`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
              <Layers className="w-4 h-4 text-brand-orange" />
              Municipal Dispatch & Triage Table
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
              Hazard Verification & Dispatch Queue
            </h1>
            <p className="text-sm text-brand-slate mt-1">
              Filter incoming citizen reports, merge nearby duplicate distress incidents, and assign maintenance crews.
            </p>
          </div>

          {selectedIds.length >= 2 && (
            <button
              onClick={handleMergeDuplicates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md shadow-purple-700/20 transition-all cursor-pointer animate-fadeIn"
            >
              <GitMerge className="w-4 h-4" />
              Merge {selectedIds.length} Selected as Duplicates
            </button>
          )}
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="bg-brand-green-light border border-green-200 text-brand-green p-3 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ {actionNotice}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-brand-neutral-grey shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="w-4 h-4 text-brand-slate absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by locality, road name, or incident ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-neutral-grey bg-brand-warm-white text-xs text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-orange/40"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 rounded-xl border border-brand-neutral-grey text-xs font-semibold text-brand-navy bg-white focus:outline-none"
            >
              <option value="all">All Verification Statuses</option>
              <option value="submitted">Submitted (Pending Review)</option>
              <option value="under_verification">Under Verification</option>
              <option value="community_confirmed">Community Confirmed</option>
              <option value="forwarded_review">Forwarded for Review</option>
              <option value="resolved">Resolved (Repaired)</option>
            </select>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-3xl border border-brand-neutral-grey shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-warm-white border-b border-brand-neutral-grey text-brand-slate font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredHazards.length && filteredHazards.length > 0}
                      onChange={handleSelectAll}
                      className="accent-brand-orange cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Incident Details</th>
                  <th className="p-4">Locality / Ward</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Verification Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-grey/70">
                {filteredHazards.map((hazard) => {
                  const isChecked = selectedIds.includes(hazard.id);
                  return (
                    <tr
                      key={hazard.id}
                      className={`hover:bg-brand-soft-blue/30 transition-colors ${
                        isChecked ? 'bg-brand-orange/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(hazard.id)}
                          className="accent-brand-orange cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {hazard.primaryImageUrl && (
                            <img
                              src={hazard.primaryImageUrl}
                              alt={hazard.title}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-brand-neutral-grey"
                            />
                          )}
                          <div>
                            <div className="font-bold text-sm text-brand-navy leading-snug">
                              {hazard.title}
                            </div>
                            <div className="text-[11px] text-brand-slate line-clamp-1 mt-0.5">
                              {hazard.address}
                            </div>
                            <div className="text-[10px] text-brand-slate-light font-mono mt-0.5">
                              ID: {hazard.id} • {hazard.confirmationsCount} confirmations
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-brand-navy">{hazard.locality}</span>
                      </td>

                      <td className="p-4">
                        <SeverityBadge severity={hazard.severity} size="sm" />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-navy">{hazard.confidenceScore}%</span>
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                hazard.confidenceScore > 85
                                  ? 'bg-brand-green'
                                  : hazard.confidenceScore > 65
                                  ? 'bg-brand-orange'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${hazard.confidenceScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={hazard.status}
                          onChange={(e) =>
                            handleQuickStatusChange(hazard.id, e.target.value as VerificationStatus)
                          }
                          className="text-xs font-semibold py-1 px-2 rounded-lg border border-brand-neutral-grey bg-white text-brand-navy focus:outline-none"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_verification">Under Verification</option>
                          <option value="community_confirmed">Community Confirmed</option>
                          <option value="forwarded_review">Forwarded for Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/admin/hazards/${hazard.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-semibold hover:bg-brand-navy-light transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
