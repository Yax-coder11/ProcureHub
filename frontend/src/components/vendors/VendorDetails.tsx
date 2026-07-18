import { useQuery } from '@tanstack/react-query';
import { Calendar, Mail, Phone, MapPin, Building2, User, Landmark, ClipboardList } from 'lucide-react';
import { Vendor } from '../../types/vendor';
import { vendorService } from '../../services/vendorService';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';

interface VendorDetailsProps {
  vendor: Vendor;
}

export function VendorDetails({ vendor }: VendorDetailsProps) {
  // Fetch activity history using TanStack Query
  const { data: logs, isLoading: isLogsLoading } = useQuery({
    queryKey: ['vendorLogs', vendor.id],
    queryFn: () => vendorService.getActivityLogs(vendor.id),
    enabled: !!vendor.id,
  });

  let statusVariant: 'success' | 'warning' | 'danger' | 'default' = 'default';
  if (vendor.status === 'active') statusVariant = 'success';
  if (vendor.status === 'pending') statusVariant = 'warning';
  if (vendor.status === 'inactive') statusVariant = 'danger';

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-500 shadow-sm flex-shrink-0">
            <Building2 className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-900">{vendor.vendorName}</h3>
              <Badge variant={statusVariant} className="capitalize">
                {vendor.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{vendor.id}</p>
            <p className="text-xs text-slate-400 font-normal mt-1">{vendor.businessName}</p>
          </div>
        </div>
        <div className="flex items-center text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-lg self-start md:self-auto shadow-sm">
          <Calendar className="h-4 w-4 mr-1.5 text-slate-400" />
          Registered: <span className="font-semibold text-slate-700 ml-1">{vendor.registrationDate}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info Card */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <User className="h-4 w-4 mr-2 text-slate-500" />
            Contact Details
          </h4>
          <div className="space-y-3 text-xs text-slate-650">
            <div className="flex items-center">
              <span className="w-24 text-slate-400 font-medium">Contact Person:</span>
              <span className="font-semibold text-slate-800">{vendor.contactPerson}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-slate-450 flex-shrink-0" />
              <span className="text-slate-700">{vendor.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-slate-450 flex-shrink-0" />
              <span className="text-slate-700">{vendor.phone}</span>
            </div>
          </div>
        </div>

        {/* GST & Compliance Card */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <Landmark className="h-4 w-4 mr-2 text-slate-500" />
            GST & Classification
          </h4>
          <div className="space-y-3 text-xs text-slate-650">
            <div className="flex items-center">
              <span className="w-24 text-slate-400 font-medium">GSTIN (GST ID):</span>
              <span className="font-mono text-slate-800 font-bold uppercase tracking-wider">{vendor.gstNumber}</span>
            </div>
            <div className="flex items-center">
              <span className="w-24 text-slate-400 font-medium">Category:</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xxs font-semibold">
                {vendor.category}
              </span>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 md:col-span-2">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <MapPin className="h-4 w-4 mr-2 text-slate-500" />
            Address Details
          </h4>
          <div className="grid gap-3 text-xs md:grid-cols-2">
            <div className="md:col-span-2">
              <span className="text-slate-400 font-medium block mb-1">Street Address:</span>
              <span className="text-slate-800 leading-relaxed font-medium">{vendor.address}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium mr-2">City / State:</span>
              <span className="text-slate-800 font-semibold">{vendor.city}, {vendor.state}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium mr-2">Pincode:</span>
              <span className="text-slate-800 font-mono font-semibold">{vendor.pincode}</span>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        {vendor.notes && (
          <div className="border border-slate-200 rounded-xl p-5 space-y-2 md:col-span-2">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center">
              <ClipboardList className="h-4 w-4 mr-2 text-slate-500" />
              Notes / Remarks
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150 font-normal">
              {vendor.notes}
            </p>
          </div>
        )}

        {/* Status History Logs */}
        <div className="border border-slate-200 rounded-xl p-5 space-y-4 md:col-span-2">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center border-b border-slate-100 pb-2">
            <ClipboardList className="h-4 w-4 mr-2 text-slate-500" />
            Status History & Audit Trail
          </h4>
          {isLogsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <p className="text-xs text-slate-450 italic">No activity logs found for this vendor.</p>
          ) : (
            <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-white" />
                  
                  <div className="flex items-center justify-between text-xxs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-550 capitalize">{log.action.replace('_', ' ')}</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700 font-normal">{log.detail}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Performed by: <span className="font-medium">{log.performedBy}</span></p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
