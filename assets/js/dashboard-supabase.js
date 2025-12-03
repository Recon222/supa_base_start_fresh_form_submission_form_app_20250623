/**
 * Dashboard Supabase Integration
 * Handles real-time data fetching and updates for the admin dashboard
 */

import { initSupabase } from './supabase.js';

let supabaseClient = null;
let realtimeSubscription = null;

/**
 * Initialize dashboard with Supabase connection
 */
export async function initDashboard() {
  try {
    supabaseClient = await initSupabase();
    
    // Load initial data
    await loadDashboardData();
    
    // Set up real-time subscription
    setupRealtimeUpdates();
    
    return true;
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    return false;
  }
}

/**
 * Load all dashboard data
 */
async function loadDashboardData() {
  try {
    // Fetch all submissions
    const { data: submissions, error } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    
    // Update statistics
    updateStats(submissions);
    
    // Update requests table
    updateRequestsTable(submissions);
    
    // Update charts data
    updateChartsData(submissions);
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

/**
 * Set up real-time subscription for live updates
 */
function setupRealtimeUpdates() {
  // Subscribe to INSERT events on form_submissions
  realtimeSubscription = supabaseClient
    .channel('dashboard-updates')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'form_submissions' 
      }, 
      (payload) => {
        console.log('Real-time update received:', payload);
        handleRealtimeUpdate(payload);
      }
    )
    .subscribe();
}

/**
 * Handle real-time updates
 */
function handleRealtimeUpdate(payload) {
  if (payload.eventType === 'INSERT') {
    // New submission
    addNewRequestToTable(payload.new);
    updateStatCounts();
    showNotification('New request received!', 'success');
  } else if (payload.eventType === 'UPDATE') {
    // Updated submission
    updateRequestInTable(payload.new);
    updateStatCounts();
  }
}

/**
 * Update statistics based on submissions data
 */
function updateStats(submissions) {
  // Count by status
  const statusCounts = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {});
  
  // Update pending count
  document.getElementById('pending-count').textContent = statusCounts.pending || 0;
  
  // Count active (processing)
  document.getElementById('active-count').textContent = statusCounts.processing || 0;
  
  // Count today's submissions
  const today = new Date().toISOString().split('T')[0];
  const todayCount = submissions.filter(sub => 
    sub.submitted_at.startsWith(today)
  ).length;
  document.getElementById('today-count').textContent = todayCount;
  
  // Update overview stats
  updateOverviewStats(submissions);
}

/**
 * Update overview statistics cards
 */
function updateOverviewStats(submissions) {
  // Total requests
  const totalRequests = submissions.length;
  const totalCard = document.querySelector('.stat-card-value');
  if (totalCard) totalCard.textContent = totalRequests.toLocaleString();
  
  // Calculate average response time (mock for now)
  // In real implementation, you'd track completion times
  const avgResponseTime = '4.2 hrs';
  
  // Calculate completion rate
  const completed = submissions.filter(s => s.status === 'completed').length;
  const completionRate = totalRequests > 0 ? 
    ((completed / totalRequests) * 100).toFixed(1) : 0;
  
  // Count urgent requests (you might add a priority field)
  const urgent = submissions.filter(s => s.status === 'pending').length;
}

/**
 * Update requests table with real data
 */
function updateRequestsTable(submissions) {
  const tbody = document.getElementById('requests-tbody');
  if (!tbody) return;
  
  // Clear existing rows
  tbody.innerHTML = '';
  
  // Add rows for each submission
  submissions.slice(0, 20).forEach(submission => {
    const row = createRequestRow(submission);
    tbody.appendChild(row);
  });
}

/**
 * Create a table row for a submission
 */
function createRequestRow(submission) {
  const row = document.createElement('tr');

  // Format submission data
  const formData = submission.form_data;
  const submittedDate = new Date(submission.submitted_at);
  const timeAgo = getTimeAgo(submittedDate);

  // Cell 1: Occurrence Number (with strong tag)
  const occCell = document.createElement('td');
  const occStrong = document.createElement('strong');
  occStrong.textContent = submission.occurrence_number || submission.id.slice(0, 8);
  occCell.appendChild(occStrong);

  // Cell 2: Request Type (with span)
  const typeCell = document.createElement('td');
  const typeSpan = document.createElement('span');
  typeSpan.className = 'request-type';
  typeSpan.textContent = submission.request_type.toUpperCase();
  typeCell.appendChild(typeSpan);

  // Cell 3: Investigator Name (user-controlled data - SECURE)
  const nameCell = document.createElement('td');
  nameCell.textContent = formData.rName || 'Unknown';

  // Cell 4: Time Ago
  const timeCell = document.createElement('td');
  timeCell.textContent = timeAgo;

  // Cell 5: Status Badge (with span)
  const statusCell = document.createElement('td');
  const statusSpan = document.createElement('span');
  statusSpan.className = `status-badge status-${submission.status.toLowerCase()}`;
  statusSpan.textContent = formatStatus(submission.status);
  statusCell.appendChild(statusSpan);

  // Cell 6: Assigned To (user-controlled data - SECURE)
  const assignedCell = document.createElement('td');
  assignedCell.textContent = formData.assignedTo || 'Unassigned';

  // Cell 7: Priority
  const priorityCell = document.createElement('td');
  priorityCell.textContent = `${getPriorityIcon(submission)} ${getPriorityLevel(submission)}`;

  // Cell 8: Action Buttons
  const actionCell = document.createElement('td');
  const actionDiv = document.createElement('div');
  actionDiv.className = 'action-buttons';

  // View Details Button
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn-icon';
  viewBtn.title = 'View Details';
  viewBtn.textContent = '👁️';
  viewBtn.addEventListener('click', () => viewDetails(submission.id));

  // Download PDF Button
  const pdfBtn = document.createElement('button');
  pdfBtn.className = 'btn-icon';
  pdfBtn.title = 'Download PDF';
  pdfBtn.textContent = '📄';
  pdfBtn.addEventListener('click', () => downloadPDF(submission.id));

  // Download JSON Button
  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'btn-icon';
  jsonBtn.title = 'Download JSON';
  jsonBtn.textContent = '{ }';
  jsonBtn.addEventListener('click', () => downloadJSON(submission.id));

  // Assign Button
  const assignBtn = document.createElement('button');
  assignBtn.className = 'btn-icon';
  assignBtn.title = 'Assign';
  assignBtn.textContent = '👤';
  assignBtn.addEventListener('click', () => assignRequest(submission.id));

  actionDiv.appendChild(viewBtn);
  actionDiv.appendChild(pdfBtn);
  actionDiv.appendChild(jsonBtn);
  actionDiv.appendChild(assignBtn);
  actionCell.appendChild(actionDiv);

  // Append all cells to row
  row.appendChild(occCell);
  row.appendChild(typeCell);
  row.appendChild(nameCell);
  row.appendChild(timeCell);
  row.appendChild(statusCell);
  row.appendChild(assignedCell);
  row.appendChild(priorityCell);
  row.appendChild(actionCell);

  return row;
}

/**
 * Add new request to table (for real-time updates)
 */
function addNewRequestToTable(submission) {
  const tbody = document.getElementById('requests-tbody');
  if (!tbody) return;
  
  const row = createRequestRow(submission);
  row.style.animation = 'fadeIn 0.5s ease';
  tbody.insertBefore(row, tbody.firstChild);
  
  // Remove last row if table is too long
  if (tbody.children.length > 20) {
    tbody.removeChild(tbody.lastChild);
  }
}

/**
 * Update existing request in table
 */
function updateRequestInTable(submission) {
  const rows = document.querySelectorAll('#requests-tbody tr');
  rows.forEach(row => {
    const caseCell = row.cells[0];
    if (caseCell.textContent.includes(submission.id.slice(0, 8))) {
      const newRow = createRequestRow(submission);
      row.replaceWith(newRow);
      newRow.style.animation = 'pulse 0.5s ease';
    }
  });
}

/**
 * Update stat counts (for real-time)
 */
async function updateStatCounts() {
  try {
    const { data: submissions, error } = await supabaseClient
      .from('form_submissions')
      .select('*');
    
    if (!error) {
      updateStats(submissions);
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

/**
 * Format status for display
 */
function formatStatus(status) {
  const statusMap = {
    'pending': 'Pending',
    'processing': 'In Progress',
    'completed': 'Completed',
    'failed': 'Failed'
  };
  return statusMap[status] || status;
}

/**
 * Get priority icon based on submission data
 */
function getPriorityIcon(submission) {
  // You could determine priority based on certain criteria
  // For now, using a simple logic
  if (submission.form_data.occType?.toLowerCase().includes('homicide')) return '🔴';
  if (submission.status === 'pending') return '🟡';
  return '🟢';
}

/**
 * Get priority level
 */
function getPriorityLevel(submission) {
  if (submission.form_data.occType?.toLowerCase().includes('homicide')) return 'High';
  if (submission.status === 'pending') return 'Medium';
  return 'Low';
}

/**
 * Calculate time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }
  
  return 'Just now';
}

/**
 * View submission details
 */
window.viewDetails = async function(id) {
  try {
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Show details in a modal or new page
    console.log('Submission details:', data);
    showNotification('Opening details...', 'info');
    
    // You could create a modal here to show full details
    showDetailsModal(data);
  } catch (error) {
    console.error('Error viewing details:', error);
    showNotification('Error loading details', 'error');
  }
};

/**
 * Download PDF from submission
 */
window.downloadPDF = async function(id) {
  try {
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Find PDF in attachments
    const pdfAttachment = data.attachments?.find(att => att.type === 'pdf');
    if (pdfAttachment) {
      // Convert base64 to blob and download
      const base64Data = pdfAttachment.data;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfAttachment.filename || `submission_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('PDF downloaded', 'success');
    } else {
      showNotification('No PDF available', 'warning');
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    showNotification('Error downloading PDF', 'error');
  }
};

/**
 * Download JSON from submission
 */
window.downloadJSON = async function(id) {
  try {
    const { data, error } = await supabaseClient
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Find JSON in attachments
    const jsonAttachment = data.attachments?.find(att => att.type === 'json');
    if (jsonAttachment) {
      // Convert base64 to blob and download
      const base64Data = jsonAttachment.data;
      const jsonString = atob(base64Data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = jsonAttachment.filename || `submission_${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      showNotification('JSON downloaded', 'success');
    } else {
      showNotification('No JSON available', 'warning');
    }
  } catch (error) {
    console.error('Error downloading JSON:', error);
    showNotification('Error downloading JSON', 'error');
  }
};

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColor = {
    success: 'linear-gradient(135deg, var(--color-success) 0%, #5cb85c 100%)',
    error: 'linear-gradient(135deg, var(--color-danger) 0%, #ff6b7a 100%)',
    warning: 'linear-gradient(135deg, var(--color-warning) 0%, #ffdb4d 100%)',
    info: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor[type] || bgColor.info};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
    z-index: 1000;
  `;
  
  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: '🔔'
  };
  
  notification.textContent = `${icon[type] || icon.info} ${message}`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Show details modal
 */
function showDetailsModal(submission) {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: var(--surface-dark);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 2rem;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  `;

  const formData = submission.form_data;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  `;
  closeBtn.addEventListener('click', () => overlay.remove());

  // Create heading
  const heading = document.createElement('h2');
  heading.style.cssText = 'color: var(--peel-yellow); margin-bottom: 1.5rem;';
  heading.textContent = 'Submission Details';

  // Create details container
  const detailsContainer = document.createElement('div');
  detailsContainer.style.cssText = 'display: grid; gap: 1rem;';

  // Helper function to create detail rows
  const createDetailRow = (label, value) => {
    const div = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    div.appendChild(strong);

    if (typeof value === 'string') {
      const textNode = document.createTextNode(value);
      div.appendChild(textNode);
    } else {
      div.appendChild(value);
    }
    return div;
  };

  // Add detail rows (all user data safely escaped via textContent)
  detailsContainer.appendChild(createDetailRow('ID', submission.id));
  detailsContainer.appendChild(createDetailRow('Type', submission.request_type));

  // Status with badge
  const statusSpan = document.createElement('span');
  statusSpan.className = `status-badge status-${submission.status.toLowerCase()}`;
  statusSpan.textContent = formatStatus(submission.status);
  detailsContainer.appendChild(createDetailRow('Status', statusSpan));

  detailsContainer.appendChild(createDetailRow('Submitted', new Date(submission.submitted_at).toLocaleString()));
  detailsContainer.appendChild(createDetailRow('Officer', formData.rName || 'N/A'));
  detailsContainer.appendChild(createDetailRow('Email', formData.requestingEmail || 'N/A'));
  detailsContainer.appendChild(createDetailRow('Phone', formData.requestingPhone || 'N/A'));
  detailsContainer.appendChild(createDetailRow('Badge', formData.badge || 'N/A'));
  detailsContainer.appendChild(createDetailRow('Occurrence #', submission.occurrence_number || 'N/A'));

  // Add separator
  const hr = document.createElement('hr');
  hr.style.borderColor = 'var(--border-color)';
  detailsContainer.appendChild(hr);

  // Add form data section
  const formDataHeading = document.createElement('h3');
  formDataHeading.style.color = 'var(--peel-yellow)';
  formDataHeading.textContent = 'Form Data';
  detailsContainer.appendChild(formDataHeading);

  // Add form data as pre-formatted JSON (textContent escapes everything)
  const pre = document.createElement('pre');
  pre.style.cssText = 'background: var(--glass-bg); padding: 1rem; border-radius: 8px; overflow-x: auto;';
  pre.textContent = JSON.stringify(formData, null, 2);
  detailsContainer.appendChild(pre);

  // Assemble modal
  modal.appendChild(closeBtn);
  modal.appendChild(heading);
  modal.appendChild(detailsContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

/**
 * Update charts with real data
 */
function updateChartsData(submissions) {
  // Group by date for weekly chart
  const weeklyData = {};
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    weeklyData[dateStr] = 0;
  }
  
  submissions.forEach(sub => {
    const date = sub.submitted_at.split('T')[0];
    if (weeklyData.hasOwnProperty(date)) {
      weeklyData[date]++;
    }
  });
  
  // Update chart bars
  const chartBars = document.querySelectorAll('.chart-placeholder .chart-bar');
  const values = Object.values(weeklyData);
  const maxValue = Math.max(...values, 1);
  
  chartBars.forEach((bar, index) => {
    if (values[index] !== undefined) {
      const height = (values[index] / maxValue) * 90;
      bar.style.height = `${height}%`;
      bar.setAttribute('data-value', values[index]);
    }
  });
  
  // Update request type distribution
  const typeCounts = submissions.reduce((acc, sub) => {
    acc[sub.request_type] = (acc[sub.request_type] || 0) + 1;
    return acc;
  }, {});
  
  // You can add more chart updates here
}

/**
 * Clean up resources
 */
export function cleanupDashboard() {
  if (realtimeSubscription) {
    supabaseClient.removeChannel(realtimeSubscription);
  }
}