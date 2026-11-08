import { SpyglassCdcEntry, JasperGoldCdcEntry, ParsedEdaReportSummary } from '../types/eda';
import { InterconnectConnection, CDCStatus } from '../types/soc';

export function parseSpyglassReport(reportText: string): ParsedEdaReportSummary {
  const lines = reportText.split('\n');
  const entries: SpyglassCdcEntry[] = [];
  let cleanCount = 0;
  let violationCount = 0;
  let waiverCount = 0;

  let currentEntry: Partial<SpyglassCdcEntry> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for ID line e.g. "ID: SG-CDC-001 | Rule: Ac_unsync01 | Severity: ERROR | Status: VIOLATION"
    if (line.startsWith('ID:') && line.includes('Rule:')) {
      if (currentEntry && currentEntry.id) {
        entries.push(currentEntry as SpyglassCdcEntry);
      }

      const parts = line.split('|').map(s => s.trim());
      const id = parts[0]?.replace('ID:', '').trim() || `SG-${entries.length + 1}`;
      const rule = parts[1]?.replace('Rule:', '').trim() || 'Ac_unsync01';
      const sev = (parts[2]?.replace('Severity:', '').trim() || 'Warning') as 'Error' | 'Warning' | 'Info';
      const statusRaw = parts[3]?.replace('Status:', '').trim().toUpperCase() || 'VIOLATION';
      const status = statusRaw.includes('WAIV') ? 'WAIVED' : (statusRaw.includes('VIOL') || statusRaw.includes('FAIL') ? 'VIOLATION' : 'VERIFIED');

      if (status === 'VIOLATION') violationCount++;
      else if (status === 'WAIVED') waiverCount++;
      else cleanCount++;

      currentEntry = {
        id,
        ruleName: rule,
        severity: sev,
        status,
        srcFlopOrPort: '',
        dstFlopOrPort: '',
        srcClock: '',
        dstClock: '',
        message: ''
      };
      continue;
    }

    if (currentEntry) {
      if (line.startsWith('Tx Domain:')) {
        currentEntry.srcClock = line.replace('Tx Domain:', '').trim();
      } else if (line.startsWith('Rx Domain:')) {
        currentEntry.dstClock = line.replace('Rx Domain:', '').trim();
      } else if (line.startsWith('Tx Flop:')) {
        currentEntry.srcFlopOrPort = line.replace('Tx Flop:', '').trim();
      } else if (line.startsWith('Rx Flop:')) {
        currentEntry.dstFlopOrPort = line.replace('Rx Flop:', '').trim();
      } else if (line.startsWith('Reason:') || line.startsWith('Impact:')) {
        currentEntry.message = (currentEntry.message ? currentEntry.message + ' ' : '') + line;
      } else if (line.startsWith('Waiver:')) {
        currentEntry.remedy = line.replace('Waiver:', '').trim();
      }
    }
  }

  if (currentEntry && currentEntry.id) {
    entries.push(currentEntry as SpyglassCdcEntry);
  }

  return {
    tool: 'synopsys_spyglass',
    timestamp: new Date().toISOString(),
    totalChecks: entries.length,
    cleanCount,
    violationCount,
    waiverCount,
    entries
  };
}

export function parseJasperGoldReport(reportText: string): ParsedEdaReportSummary {
  const lines = reportText.split('\n');
  const entries: JasperGoldCdcEntry[] = [];
  let cleanCount = 0;
  let violationCount = 0;
  let waiverCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    // Parse table row e.g. "| JG01 | CDC_STRUCTURAL_UNSYNC | VIOLATION | clk_core_1800m | clk_sys_noc_500m | None (Missing Sync) |"
    if (trimmed.startsWith('|') && !trimmed.includes('---') && !trimmed.includes('Check Type')) {
      const cols = trimmed.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 6) {
        const id = cols[0];
        const checkType = cols[1] as any;
        const statusRaw = cols[2].toUpperCase();
        const srcDomain = cols[3];
        const dstDomain = cols[4];
        const syncType = cols[5];

        let status: 'VIOLATION' | 'PROVEN_CLEAN' | 'ASSUMED' | 'WAIVED' = 'PROVEN_CLEAN';
        if (statusRaw.includes('VIOL')) {
          status = 'VIOLATION';
          violationCount++;
        } else if (statusRaw.includes('WAIV')) {
          status = 'WAIVED';
          waiverCount++;
        } else {
          cleanCount++;
        }

        entries.push({
          id,
          checkType,
          status,
          srcDomain,
          dstDomain,
          txPath: `${srcDomain}_tx_reg`,
          rxPath: `${dstDomain}_rx_reg`,
          syncType,
          comments: `JasperGold CDC result: ${statusRaw}`
        });
      }
    }
  }

  return {
    tool: 'cadence_jaspergold',
    timestamp: new Date().toISOString(),
    totalChecks: entries.length,
    cleanCount,
    violationCount,
    waiverCount,
    entries
  };
}

// Map parsed report to our SoC connections
export function applyEdaReportToConnections(
  connections: InterconnectConnection[],
  report: ParsedEdaReportSummary
): InterconnectConnection[] {
  return connections.map(conn => {
    // Look for matching domains in the report
    for (const entry of report.entries) {
      let isMatch = false;
      let newStatus: CDCStatus = conn.cdcStatus;
      let newEdaCheckId = conn.edaCheckId;
      let newReportSource = conn.reportSource;

      if ('ruleName' in entry) {
        // Synopsys SpyGlass
        if (
          (conn.srcClock && entry.srcClock.includes(conn.srcClock.split('_')[1])) ||
          (conn.srcClock === entry.srcClock) ||
          (entry.srcFlopOrPort.toLowerCase().includes(conn.srcModuleId.toLowerCase().replace('subsys_', '')))
        ) {
          isMatch = true;
          if (entry.status === 'VIOLATION') newStatus = 'violation';
          else if (entry.status === 'WAIVED') newStatus = 'waiver';
          else if (entry.status === 'VERIFIED') newStatus = 'clean';
          newEdaCheckId = `${entry.ruleName} (${entry.id})`;
          newReportSource = 'synopsys_spyglass';
        }
      } else {
        // Cadence JasperGold
        if (
          conn.srcClock === entry.srcDomain ||
          (conn.dstClock === entry.dstDomain && conn.srcClock === entry.srcDomain)
        ) {
          isMatch = true;
          if (entry.status === 'VIOLATION') newStatus = 'violation';
          else if (entry.status === 'WAIVED') newStatus = 'waiver';
          else if (entry.status === 'PROVEN_CLEAN') newStatus = 'clean';
          newEdaCheckId = `${entry.checkType} (${entry.id})`;
          newReportSource = 'cadence_jaspergold';
        }
      }

      if (isMatch) {
        return {
          ...conn,
          cdcStatus: newStatus,
          edaCheckId: newEdaCheckId,
          reportSource: newReportSource
        };
      }
    }
    return conn;
  });
}
