import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Application {
  id: string
  name: string
  description: string | null
  api_key: string
  source_paths: string[] | null
  created_at: string
  updated_at: string
}

export interface LogEntry {
  id: number
  app_id: string
  timestamp: string
  level: 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  logger: string | null
  message: string | null
  stack_trace: string | null
  file_name: string | null
  line_number: number | null
  class_name: string | null
  method_name: string | null
  trace_id: string | null
  thread_name: string | null
  mdc_context: Record<string, string> | null
  created_at: string
}

export interface ErrorCluster {
  id: string
  app_id: string
  fingerprint: string
  exception_class: string | null
  message_pattern: string | null
  primary_file: string | null
  primary_line: number | null
  primary_method: string | null
  primary_class: string | null
  occurrence_count: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'IGNORED'
  first_seen: string
  last_seen: string
  created_at: string
  updated_at: string
}

export interface AnalysisResult {
  id: string
  cluster_id: string
  explanation: string | null
  root_cause: string | null
  recommendation: string | null
  patch: string | null
  patch_file_name: string | null
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'
  model_used: string | null
  tokens_used: number | null
  raw_response: string | null
  created_at: string
}

export interface ScanHistory {
  id: string
  app_id: string
  status: 'RUNNING' | 'COMPLETED' | 'FAILED'
  started_at: string
  completed_at: string | null
  logs_scanned: number
  errors_found: number
  clusters_created: number
  clusters_analyzed: number
  error_message: string | null
}

export interface Settings {
  id: string
  key: string
  value: string | null
  encrypted: boolean
  created_at: string
  updated_at: string
}

// API functions
export async function getApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createApplication(name: string, description?: string): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({ name, description })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getErrorClusters(appId: string): Promise<ErrorCluster[]> {
  const { data, error } = await supabase
    .from('error_clusters')
    .select('*')
    .eq('app_id', appId)
    .order('occurrence_count', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getErrorCluster(id: string): Promise<ErrorCluster | null> {
  const { data, error } = await supabase
    .from('error_clusters')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getClusterAnalysis(clusterId: string): Promise<AnalysisResult | null> {
  const { data, error } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('cluster_id', clusterId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
  return data
}

export async function getScanHistory(appId: string): Promise<ScanHistory[]> {
  const { data, error } = await supabase
    .from('scan_history')
    .select('*')
    .eq('app_id', appId)
    .order('started_at', { ascending: false })
    .limit(10)
  
  if (error) throw error
  return data || []
}

export async function getRecentLogs(appId: string, limit = 100): Promise<LogEntry[]> {
  const { data, error } = await supabase
    .from('log_entries')
    .select('*')
    .eq('app_id', appId)
    .order('timestamp', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
}

export async function getAppStats(appId: string) {
  const { data, error } = await supabase.rpc('get_app_stats', { app_uuid: appId })
  if (error) throw error
  return data?.[0] || { total_logs: 0, error_logs: 0, cluster_count: 0, critical_count: 0, last_error: null }
}

export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data?.value || null
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  
  if (error) throw error
}

export async function updateClusterStatus(clusterId: string, status: ErrorCluster['status']): Promise<void> {
  const { error } = await supabase
    .from('error_clusters')
    .update({ status })
    .eq('id', clusterId)
  
  if (error) throw error
}

// Edge function calls
export async function triggerScan(appId: string, hours = 24, analyze = false) {
  const { data, error } = await supabase.functions.invoke('scan', {
    body: { app_id: appId, hours, analyze }
  })
  
  if (error) throw error
  return data
}

export async function analyzeCluster(clusterId: string) {
  const { data, error } = await supabase.functions.invoke('analyze', {
    body: { cluster_id: clusterId }
  })
  
  if (error) throw error
  return data
}

export async function generatePatch(clusterId: string, sourceCode?: string) {
  const { data, error } = await supabase.functions.invoke('generate-patch', {
    body: { cluster_id: clusterId, source_code: sourceCode }
  })
  
  if (error) throw error
  return data
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

