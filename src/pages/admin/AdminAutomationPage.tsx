import React, { useState, useEffect } from 'react';
import { N8NService } from '../../services/n8nService';
import { StorageService } from '../../services/storageService';
import { N8NWorkflowExecution } from '../../types';
import {
  Cpu,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Terminal,
  ShieldCheck,
  FileCode,
  Zap,
  Activity
} from 'lucide-react';

export const AdminAutomationPage: React.FC = () => {
  const [executions, setExecutions] = useState<N8NWorkflowExecution[]>([]);
  const [isRunningJob, setIsRunningJob] = useState(false);
  const [jobNotice, setJobNotice] = useState<string | null>(null);
  const isLive = N8NService.isLiveConfigured();
  const webhookUrl = N8NService.getWebhookUrl();

  const loadExecutions = () => {
    setExecutions(N8NService.getExecutions());
  };

  useEffect(() => {
    loadExecutions();
  }, []);

  const handleRunFreshnessJob = () => {
    setIsRunningJob(true);
    setTimeout(() => {
      const exec = N8NService.runFreshnessReconfirmationJob();
      loadExecutions();
      setIsRunningJob(false);
      setJobNotice(exec.payloadSummary);
      setTimeout(() => setJobNotice(null), 5000);
    }, 450);
  };

  const handleTestReportTrigger = async () => {
    const hazards = StorageService.getHazards();
    const testHazard = hazards[0];
    if (!testHazard) return;

    setIsRunningJob(true);
    await N8NService.dispatchReportEvent(testHazard);
    loadExecutions();
    setIsRunningJob(false);
    setJobNotice(`Simulated webhook trigger executed for hazard ${testHazard.id}`);
    setTimeout(() => setJobNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-brand-warm-white py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Authority Header */}
        <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-3xl shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-orange mb-1">
              <Cpu className="w-4 h-4 text-brand-orange" />
              n8n Cloud Pro Automation Center (v2.45.7)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Automated Incident Triage & Freshness Cron
            </h1>
            <p className="text-xs sm:text-sm text-brand-slate-light mt-1 max-w-2xl">
              Serverless orchestration managing incoming citizen reports, waterlogged road triage, 2:00 AM reconfirmation crons, and municipal resolution audit workflows.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRunFreshnessJob}
              disabled={isRunningJob}
              className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold transition-all shadow-subtle flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningJob ? 'animate-spin' : ''}`} />
              <span>{isRunningJob ? 'Executing Job...' : 'Run Freshness Cron'}</span>
            </button>
            <button
              onClick={handleTestReportTrigger}
              disabled={isRunningJob}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-brand-orange" />
              <span>Test Report Webhook</span>
            </button>
          </div>
        </div>

        {/* Action notification */}
        {jobNotice && (
          <div className="bg-brand-green-light border border-green-200 text-brand-green p-3 rounded-2xl text-xs font-bold text-center animate-fadeIn">
            ✓ {jobNotice}
          </div>
        )}

        {/* Integration Status Bar */}
        <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${isLive ? 'bg-emerald-500 animate-ping' : 'bg-blue-600'}`} />
            <div>
              <div className="text-xs font-bold text-brand-navy flex items-center gap-2">
                <span>Deployment Mode:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                  {isLive ? 'n8n Cloud Pro Live Production' : 'Local Prototype Sandboxed (JSON Workflow Exports Ready)'}
                </span>
              </div>
              <p className="text-[11px] text-brand-slate mt-0.5">
                {isLive
                  ? `Active webhook endpoint: ${webhookUrl}`
                  : 'JSON workflow exports located in n8n/workflows/. Set VITE_N8N_WEBHOOK_URL to stream directly to an n8n Cloud Pro instance.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-slate">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Idempotency deduplication active</span>
          </div>
        </div>

        {/* Three Production Workflows Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Workflow 1 */}
          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                  WEBHOOK TRIGGER
                </span>
                <span className="text-[10px] text-brand-slate font-mono">wf-report-01</span>
              </div>
              <h3 className="text-sm font-bold text-brand-navy leading-snug">
                New Hazard Report Processor & Waterlogged Triage
              </h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Ingests citizen reports, validates GPS boundary, verifies idempotency key, sets canonical stage to <code className="text-brand-orange bg-brand-warm-white px-1">NEWLY_REPORTED</code>, and detects waterlogged edges.
              </p>
            </div>
            <div className="pt-2 border-t border-brand-neutral-grey/60 flex items-center justify-between text-[11px] text-brand-slate">
              <span className="font-mono">n8n/workflows/roadsense_new_hazard_report_processor.json</span>
            </div>
          </div>

          {/* Workflow 2 */}
          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  CRON 0 2 * * *
                </span>
                <span className="text-[10px] text-brand-slate font-mono">wf-freshness-01</span>
              </div>
              <h3 className="text-sm font-bold text-brand-navy leading-snug">
                Hazard Freshness & Reconfirmation Cron
              </h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Evaluates active hazard age every night at 2:00 AM. Flags waterlogged roads older than 24h and potholes older than 7 days as <code className="text-brand-orange bg-brand-warm-white px-1">STALE_NEEDS_RECONFIRMATION</code>.
              </p>
            </div>
            <div className="pt-2 border-t border-brand-neutral-grey/60 flex items-center justify-between text-[11px] text-brand-slate">
              <span className="font-mono">n8n/workflows/roadsense_hazard_freshness_reconfirmation.json</span>
            </div>
          </div>

          {/* Workflow 3 */}
          <div className="bg-white p-5 rounded-3xl border border-brand-neutral-grey shadow-subtle space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  AUDIT DISPATCH
                </span>
                <span className="text-[10px] text-brand-slate font-mono">wf-resolution-01</span>
              </div>
              <h3 className="text-sm font-bold text-brand-navy leading-snug">
                Municipal Resolution Sign-off & Audit Follow-up
              </h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Listens for contractor repair sign-offs. Validates post-repair photo proof URL and remarks, upgrades status to <code className="text-brand-green bg-brand-warm-white px-1">CONFIRMED_RESOLVED</code>, and logs immutable audit trail.
              </p>
            </div>
            <div className="pt-2 border-t border-brand-neutral-grey/60 flex items-center justify-between text-[11px] text-brand-slate">
              <span className="font-mono">n8n/workflows/roadsense_resolution_followup.json</span>
            </div>
          </div>
        </div>

        {/* Execution History Table */}
        <div className="bg-white rounded-3xl p-6 border border-brand-neutral-grey shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-brand-neutral-grey">
            <div>
              <h3 className="text-sm font-bold text-brand-navy uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-orange" />
                Live Execution Logs ({executions.length})
              </h3>
              <p className="text-xs text-brand-slate">Chronological pipeline telemetry recorded from n8n executions</p>
            </div>
            <button
              onClick={loadExecutions}
              className="text-xs font-semibold text-brand-orange hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-warm-white border-b border-brand-neutral-grey text-brand-slate font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Execution ID</th>
                  <th className="p-3">Workflow</th>
                  <th className="p-3">Trigger Mode</th>
                  <th className="p-3">Started At</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payload Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-neutral-grey/70">
                {executions.map((exec) => (
                  <tr key={exec.id} className="hover:bg-brand-soft-blue/30 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-brand-navy font-bold">
                      {exec.id}
                    </td>
                    <td className="p-3 font-semibold text-brand-navy">
                      {exec.workflowName}
                    </td>
                    <td className="p-3">
                      <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {exec.mode}
                      </span>
                    </td>
                    <td className="p-3 text-brand-slate text-[11px]">
                      {new Date(exec.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-brand-slate">
                      {exec.executionTimeMs} ms
                    </td>
                    <td className="p-3">
                      {exec.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 text-red-600" />
                          Error
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-brand-slate text-[11px] max-w-xs truncate" title={exec.payloadSummary}>
                      {exec.payloadSummary}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

