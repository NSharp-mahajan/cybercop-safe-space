import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Phone, 
  MapPin, 
  Calendar,
  DollarSign,
  User,
  Clock,
  Search,
  Filter,
  X,
  Eye,
  Gavel,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { CrimeReport, StateCrimeReports } from '@/services/crimeReportsService';

interface CrimeReportsViewerProps {
  stateReports: StateCrimeReports;
  onClose: () => void;
}

export const CrimeReportsViewer: React.FC<CrimeReportsViewerProps> = ({ 
  stateReports, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCrimeType, setFilterCrimeType] = useState<string>('all');

  // Filter reports based on search and filters
  const filteredReports = stateReports.recentReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    const matchesCrimeType = filterCrimeType === 'all' || report.crimeType === filterCrimeType;
    
    return matchesSearch && matchesStatus && matchesCrimeType;
  });

  // Get status icon and color
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Under Investigation':
        return { icon: <Activity className="h-4 w-4" />, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' };
      case 'FIR Filed':
        return { icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500/20 text-blue-300 border-blue-500/50' };
      case 'Arrest Made':
        return { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500/20 text-green-300 border-green-500/50' };
      case 'Case Closed':
        return { icon: <XCircle className="h-4 w-4" />, color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' };
      case 'Court Proceedings':
        return { icon: <Gavel className="h-4 w-4" />, color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
      default:
        return { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-gray-500/20 text-gray-300 border-gray-500/50' };
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'High': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'Critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  // Get unique crime types for filter
  const crimeTypes = Array.from(new Set(stateReports.recentReports.map(r => r.crimeType)));
  const statuses = Array.from(new Set(stateReports.recentReports.map(r => r.status)));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-xl max-w-7xl w-full max-h-[95vh] overflow-auto shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/60 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-cyan-500/25">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{stateReports.stateName} Crime Reports</h2>
                <p className="text-slate-400">
                  Total Reports: {stateReports.totalReports.toLocaleString()} | 
                  Last Updated: {stateReports.lastUpdated}
                </p>
              </div>
            </div>
            <Button 
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by case number, title, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <select
              value={filterCrimeType}
              onChange={(e) => setFilterCrimeType(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Crime Types</option>
              {crimeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {selectedReport ? (
            /* Detailed Report View */
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white"
                  size="sm"
                >
                  ← Back to Reports
                </Button>
                <h3 className="text-2xl font-bold text-white">{selectedReport.title}</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-slate-800/80 border border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-cyan-400" />
                        Case Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-slate-400">Case Number</label>
                          <p className="text-white font-mono">{selectedReport.caseNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Crime Type</label>
                          <p className="text-white">{selectedReport.crimeType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Date Reported</label>
                          <p className="text-white flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(selectedReport.dateReported).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Location</label>
                          <p className="text-white flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {selectedReport.location}, {selectedReport.district}
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="bg-slate-700" />
                      
                      <div>
                        <label className="text-sm text-slate-400">Description</label>
                        <p className="text-white mt-1 leading-relaxed">{selectedReport.description}</p>
                      </div>

                      <div>
                        <label className="text-sm text-slate-400">Modus Operandi</label>
                        <p className="text-white mt-1 leading-relaxed">{selectedReport.modus}</p>
                      </div>

                      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Prevention Tip
                        </h4>
                        <p className="text-blue-200 text-sm">{selectedReport.preventionTip}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                  <Card className="bg-slate-800/80 border border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                        Case Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <Badge className={`${getStatusInfo(selectedReport.status).color} px-4 py-2 text-lg`}>
                          {getStatusInfo(selectedReport.status).icon}
                          <span className="ml-2">{selectedReport.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <Badge className={`${getSeverityColor(selectedReport.severity)} px-3 py-1`}>
                          {selectedReport.severity} Severity
                        </Badge>
                      </div>

                      <Separator className="bg-slate-700" />

                      <div className="text-center p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <DollarSign className="h-8 w-8 text-red-300 mx-auto mb-2" />
                        <p className="text-sm text-red-200">Financial Loss</p>
                        <p className="text-2xl font-bold text-red-300">₹{selectedReport.amount.toLocaleString()}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/80 border border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-cyan-400" />
                        Victim Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Age</span>
                        <span className="text-white">{selectedReport.victimAge} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gender</span>
                        <span className="text-white">{selectedReport.victimGender}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/80 border border-slate-700/60">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-cyan-400" />
                        Investigation Team
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-slate-400">Officer in Charge</label>
                        <p className="text-white">{selectedReport.officerInCharge}</p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Contact Number</label>
                        <p className="text-white flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedReport.contactNumber}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-slate-400">Last Update</label>
                        <p className="text-white flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedReport.lastUpdate}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            /* Reports List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {filteredReports.length} Crime Reports Found
                </h3>
                <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50">
                  Showing Recent Cases
                </Badge>
              </div>

              <div className="grid gap-4">
                {filteredReports.map((report) => {
                  const statusInfo = getStatusInfo(report.status);
                  
                  return (
                    <Card key={report.id} className="bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800/90 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-lg font-semibold text-white">{report.title}</h4>
                              <Badge className={`${statusInfo.color} text-xs`}>
                                {statusInfo.icon}
                                <span className="ml-1">{report.status}</span>
                              </Badge>
                              <Badge className={`${getSeverityColor(report.severity)} text-xs`}>
                                {report.severity}
                              </Badge>
                            </div>
                            
                            <p className="text-slate-300 text-sm mb-3 line-clamp-2">{report.description}</p>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-400">
                              <span className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                {report.caseNumber}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {report.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(report.dateReported).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                ₹{report.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => setSelectedReport(report)}
                            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">No crime reports found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrimeReportsViewer;
