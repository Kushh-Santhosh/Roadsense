# RoadSense — n8n Cloud Automation Integration

This directory contains the production-ready n8n workflow definitions for the **RoadSense** road hazard intelligence platform, tailored for **n8n Cloud Pro (v2.45.7)**.

---

## Workflows Included

| Workflow File | Suggested Workflow Name | Trigger | Purpose |
|---|---|---|---|
| `workflows/roadsense_new_hazard_report_processor.json` | **RoadSense — New Hazard Report Processor** | Webhook (`POST /roadsense-hazard-report`) | Validates payload, checks idempotency, classifies waterlogged roads (`POTENTIALLY_HIDDEN_SURFACE_HAZARD`), and logs audit entry. |
| `workflows/roadsense_hazard_freshness_reconfirmation.json` | **RoadSense — Hazard Freshness and Reconfirmation** | Schedule (Daily at 02:00 AM IST) | Applies category-specific reconfirmation windows (24h for waterlogging, 168h for potholes) and marks stale records as `STALE_NEEDS_RECONFIRMATION`. |
| `workflows/roadsense_resolution_followup.json` | **RoadSense — Resolution Evidence Follow-up** | Webhook (`POST /roadsense-resolution-signed`) | Validates contractor photographic proof of repair and transitions state to `CONFIRMED_RESOLVED`. |

---

## How to Import into n8n Cloud Pro

1. Log in to your **n8n Cloud Pro** instance (v2.45.7).
2. Click **Workflows** in the left sidebar $\rightarrow$ click **Add Workflow** $\rightarrow$ select the **⋮ (More actions)** menu $\rightarrow$ **Import from File**.
3. Select any of the JSON files in this directory:
   - `n8n/workflows/roadsense_new_hazard_report_processor.json`
   - `n8n/workflows/roadsense_hazard_freshness_reconfirmation.json`
   - `n8n/workflows/roadsense_resolution_followup.json`
4. The workflow graph will populate with all nodes, JavaScript logic, and connections intact.
5. In the Webhook node, copy the **Production URL**.
6. Toggle the workflow to **Active**.

---

## Security Architecture & Best Practices

```
┌──────────────┐      ┌──────────────┐      ┌─────────────────┐      ┌─────────────┐
│  React App   │ ───► │   Supabase   │ ───► │ Server Dispatch │ ───► │ n8n Webhook │
│ (Frontend)   │      │  (Postgres)  │      │ (Edge Function) │      │  (Cloud)    │
└──────────────┘      └──────────────┘      └─────────────────┘      └─────────────┘
```

* **Never expose webhook secrets in frontend code:** The frontend writes directly to Supabase via authenticated user tokens or persistent demo storage. Supabase Database Webhooks or Edge Functions then securely forward events to n8n with an HMAC signature or Authorization header.
* **Idempotency:** Every report includes an `eventId` (`evt_${reportId}`). Repeated submissions with the same `eventId` are deduplicated by the workflow logic to prevent duplicate database writes.

---

## Testing Webhook Payloads

You can test the **New Hazard Report Processor** webhook with `curl`:

```bash
curl -X POST "https://<your-n8n-instance>.app.n8n.cloud/webhook/roadsense-hazard-report" \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "rep-test-01",
    "category": "waterlogged_road",
    "latitude": 13.0012,
    "longitude": 77.6834,
    "locality": "KR Puram",
    "address": "Old Madras Road underpass",
    "severity": "critical",
    "timestamp": "2026-10-31T06:30:00Z"
  }'
```

**Expected Response (`200 OK`):**
```json
{
  "status": "success",
  "workflowName": "RoadSense — New Hazard Report Processor",
  "category": "waterlogged_road",
  "additionalLabel": "POTENTIALLY_HIDDEN_SURFACE_HAZARD",
  "advisoryMessage": "Waterlogged road ahead. Road surface may be uneven. Proceed cautiously.",
  "triagePriority": "CRITICAL_UNSEEN_DEPTH",
  "processingStatus": "PROCESSED_WATERLOG_FLAGGED"
}
```
