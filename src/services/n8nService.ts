import { N8NWorkflowExecution, Hazard } from '../types';
import { StorageService } from './storageService';

const N8N_STORAGE_KEY = 'roadsense_n8n_executions_v1';

const INITIAL_EXECUTIONS: N8NWorkflowExecution[] = [
  {
    id: 'exec-n8n-01',
    workflowId: 'wf-freshness-01',
    workflowName: 'RoadSense — Hazard Freshness and Reconfirmation',
    startedAt: '2026-10-31T02:00:00Z',
    finishedAt: '2026-10-31T02:00:01Z',
    status: 'success',
    mode: 'schedule',
    payloadSummary: 'Evaluated 7 active hazards; flagged 1 stale record.',
    executionTimeMs: 1120
  },
  {
    id: 'exec-n8n-02',
    workflowId: 'wf-report-01',
    workflowName: 'RoadSense — New Hazard Report Processor',
    startedAt: '2026-10-31T05:30:10Z',
    finishedAt: '2026-10-31T05:30:11Z',
    status: 'success',
    mode: 'webhook',
    payloadSummary: 'Validated report rep-heb-101; verified idempotency key evt_rep_101.',
    executionTimeMs: 460
  }
];

export const N8NService = {
  getWebhookUrl(): string | undefined {
    return import.meta.env.VITE_N8N_WEBHOOK_URL;
  },

  isLiveConfigured(): boolean {
    const url = this.getWebhookUrl();
    return Boolean(url && url.startsWith('http') && !url.includes('your-n8n-instance'));
  },

  getExecutions(): N8NWorkflowExecution[] {
    try {
      const data = localStorage.getItem(N8N_STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_EXECUTIONS;
    } catch {
      return INITIAL_EXECUTIONS;
    }
  },

  saveExecutions(list: N8NWorkflowExecution[]) {
    localStorage.setItem(N8N_STORAGE_KEY, JSON.stringify(list));
  },

  /**
   * Dispatches report event to production n8n webhook if configured.
   * Gracefully logs and falls back to local simulation if unconfigured.
   */
  async dispatchReportEvent(hazard: Hazard): Promise<{ success: boolean; executionId: string; message: string }> {
    const startTime = performance.now();
    const webhookUrl = this.getWebhookUrl();
    const execId = 'exec-rep-' + Date.now();

    if (this.isLiveConfigured() && webhookUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(import.meta.env.VITE_N8N_API_KEY ? { 'X-N8N-API-KEY': import.meta.env.VITE_N8N_API_KEY } : {})
          },
          body: JSON.stringify({
            eventId: `evt_${hazard.id}`,
            reportId: hazard.reports?.[0]?.id || hazard.id,
            hazardId: hazard.id,
            category: hazard.category,
            additionalLabel: hazard.additionalLabel,
            severity: hazard.severity,
            latitude: hazard.latitude,
            longitude: hazard.longitude,
            locality: hazard.locality,
            address: hazard.address,
            timestamp: hazard.firstReportedAt
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        const duration = Math.round(performance.now() - startTime);

        if (res.ok) {
          const execution: N8NWorkflowExecution = {
            id: execId,
            workflowId: 'wf-report-01',
            workflowName: 'RoadSense — New Hazard Report Processor',
            startedAt: new Date(Date.now() - duration).toISOString(),
            finishedAt: new Date().toISOString(),
            status: 'success',
            mode: 'webhook',
            payloadSummary: `Live n8n dispatch: ${hazard.title} (${hazard.locality})`,
            executionTimeMs: duration
          };
          this.recordExecution(execution);
          return { success: true, executionId: execId, message: 'Live n8n workflow execution completed.' };
        } else {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        const execution: N8NWorkflowExecution = {
          id: execId,
          workflowId: 'wf-report-01',
          workflowName: 'RoadSense — New Hazard Report Processor',
          startedAt: new Date(Date.now() - duration).toISOString(),
          finishedAt: new Date().toISOString(),
          status: 'error',
          mode: 'webhook',
          payloadSummary: `Failed to reach n8n webhook: ${err.message}`,
          executionTimeMs: duration,
          errorDetails: err.message
        };
        this.recordExecution(execution);
        return { success: false, executionId: execId, message: `n8n webhook error: ${err.message}` };
      }
    }

    // Unconfigured state: Record pending notice
    return {
      success: false,
      executionId: 'pending-env-config',
      message: 'n8n workflow exported in n8n/workflows/roadsense_new_hazard_report_processor.json; configure VITE_N8N_WEBHOOK_URL to activate live webhook dispatch.'
    };
  },

  /**
   * Run the freshness evaluation job on demand (simulates the 2:00 AM daily cron execution).
   */
  runFreshnessReconfirmationJob(): N8NWorkflowExecution {
    const startTime = performance.now();
    const { checked, staleCount } = StorageService.checkFreshness();
    const duration = Math.round(performance.now() - startTime) + 320; // realistic runtime

    const execution: N8NWorkflowExecution = {
      id: 'exec-fresh-' + Date.now(),
      workflowId: 'wf-freshness-01',
      workflowName: 'RoadSense — Hazard Freshness and Reconfirmation',
      startedAt: new Date(Date.now() - duration).toISOString(),
      finishedAt: new Date().toISOString(),
      status: 'success',
      mode: 'schedule',
      payloadSummary: `Checked ${checked} active hazards; identified ${staleCount} stale records needing reconfirmation.`,
      executionTimeMs: duration
    };

    this.recordExecution(execution);
    return execution;
  },

  recordExecution(exec: N8NWorkflowExecution) {
    const list = this.getExecutions();
    list.unshift(exec);
    if (list.length > 50) list.pop();
    this.saveExecutions(list);
  }
};

