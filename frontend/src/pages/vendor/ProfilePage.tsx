import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Building2,
  User,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle2,
  Shield,
  Bell,
  RefreshCw,
  Edit2,
  Save,
  Download,
  Upload,
  Trash2,
  Eye,
  Key,
  ShieldCheck,
  AlertCircle,
  Phone,
  Globe,
  Mail,
  Landmark,
  Plus,
  Sun,
  Moon,
  Check,
  Clock,
  ExternalLink,
  ChevronRight,
  Loader2
} from 'lucide-react';

import { useToast } from '../../components/ui/toast';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Dialog } from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/skeleton';
import { vendorProfileService, VendorProfile } from '../../services/vendorProfileService';

// --- ZOD VALIDATION SCHEMAS ---

const companySchema = z.object({
  companyName: z.string().min(2, 'Company Name must be at least 2 characters'),
  legalBusinessName: z.string().min(2, 'Legal Business Name must be at least 2 characters'),
  vendorId: z.string(),
  businessType: z.string().min(2, 'Business Type is required'),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format (e.g. 27AAAAA1111A1Z1)'),
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. AAAAA1111A)'),
  taxRegistrationNumber: z.string().min(2, 'Tax Registration Number is required'),
  website: z.string().url('Invalid website URL').or(z.literal('')),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  alternatePhone: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

const contactSchema = z.object({
  primaryContact: z.string().min(2, 'Primary Contact name is required'),
  jobTitle: z.string().min(2, 'Job Title is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
});

const addressSchema = z.object({
  addressLine1: z.string().min(5, 'Address Line 1 must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().regex(/^[0-9]{5,6}$/, 'Postal code must be 5 or 6 digits'),
});

const bankSchema = z.object({
  bankName: z.string().min(2, 'Bank Name is required'),
  accountHolder: z.string().min(2, 'Account Holder Name is required'),
  accountNumber: z.string().regex(/^[0-9]{9,18}$/, 'Account Number must be between 9 and 18 digits'),
  ifscSwift: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g. HDFC0000104)'),
  branch: z.string().min(2, 'Branch Name is required'),
  upiId: z.string().optional(),
});

const profileFormSchema = z.object({
  company: companySchema,
  contact: contactSchema,
  address: addressSchema,
  bank: bankSchema,
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- UI STATES ---
  const [activeTab, setActiveTab] = React.useState<'company' | 'contact' | 'address-bank' | 'documents' | 'security'>('company');
  const [isEditing, setIsEditing] = React.useState(false);
  const [theme, setTheme] = React.useState(() => localStorage.getItem('po_dashboard_theme') || 'light');
  
  // Modals & previews state
  const [viewingDoc, setViewingDoc] = React.useState<{ type: string; name: string } | null>(null);
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = React.useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = React.useState(false);
  const [isUploadingDocType, setIsUploadingDocType] = React.useState<string | null>(null);

  // --- THEME SYNC ---
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('po_dashboard_theme', next);
    toast({
      title: 'Theme Toggled',
      description: `Switched to ${next} theme.`,
      variant: 'info'
    });
  };

  // --- TANSTACK QUERIES & MUTATIONS ---

  // 1. Profile details query
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['vendorProfile'],
    queryFn: () => vendorProfileService.getProfile(),
  });

  // 2. KPI metrics query
  const { data: kpis, isLoading: isKpisLoading, refetch: refetchKpis } = useQuery({
    queryKey: ['vendorProfileKPIs'],
    queryFn: () => vendorProfileService.getKPIs(),
  });

  // 3. Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updatedValues: Partial<VendorProfile>) => vendorProfileService.updateProfile(updatedValues),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      toast({
        title: 'Profile Saved',
        description: 'Your company profile information was updated successfully.',
        variant: 'success',
      });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast({
        title: 'Update Failed',
        description: err.message || 'An error occurred while saving the profile.',
        variant: 'destructive',
      });
    },
  });

  // 4. Verify bank mutation
  const verifyBankMutation = useMutation({
    mutationFn: () => vendorProfileService.verifyBank(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      toast({
        title: 'Bank Verified',
        description: 'Your bank account was verified successfully via secure mock penny-drop.',
        variant: 'success',
      });
    },
    onSettled: () => {
      setIsVerifyingBank(false);
    }
  });

  // 5. Upload document mutation
  const uploadDocMutation = useMutation({
    mutationFn: ({ docType, fileName }: { docType: keyof VendorProfile['documents']; fileName: string }) =>
      vendorProfileService.uploadDocument(docType, fileName),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      let readableName = variables.docType.replace(/([A-Z])/g, ' $1');
      readableName = readableName.charAt(0).toUpperCase() + readableName.slice(1);
      toast({
        title: 'Document Uploaded',
        description: `${readableName} file was uploaded successfully.`,
        variant: 'success',
      });
    },
    onSettled: () => {
      setIsUploadingDocType(null);
    }
  });

  // 6. Delete document mutation
  const deleteDocMutation = useMutation({
    mutationFn: (docType: keyof VendorProfile['documents']) => vendorProfileService.deleteDocument(docType),
    onSuccess: (_, docType) => {
      queryClient.invalidateQueries({ queryKey: ['vendorProfile'] });
      let readableName = docType.replace(/([A-Z])/g, ' $1');
      readableName = readableName.charAt(0).toUpperCase() + readableName.slice(1);
      toast({
        title: 'Document Deleted',
        description: `${readableName} file was deleted successfully.`,
        variant: 'warning',
      });
    },
  });

  // --- FORM INITIALIZATION ---
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange',
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  // Hydrate form when profile data loads
  React.useEffect(() => {
    if (profileData) {
      reset({
        company: profileData.company,
        contact: profileData.contact,
        address: profileData.address,
        bank: profileData.bank,
      });
    }
  }, [profileData, reset]);

  // Watch fields for real-time progress & checklist check
  const watchedValues = watch();

  // --- PROGRESS & CHECKLIST CALCULATION ---
  const checklist = React.useMemo(() => {
    if (!watchedValues.company) return [];

    const companyInfoValid = !!(
      watchedValues.company.companyName &&
      watchedValues.company.legalBusinessName &&
      watchedValues.company.businessType &&
      watchedValues.company.gstNumber &&
      watchedValues.company.panNumber
    );

    const contactInfoValid = !!(
      watchedValues.contact?.primaryContact &&
      watchedValues.contact?.email &&
      watchedValues.contact?.mobile
    );

    const gstDetailsValid = !!(
      watchedValues.company.gstNumber &&
      profileData?.documents.gstCertificate
    );

    const bankDetailsValid = !!(
      watchedValues.bank?.bankName &&
      watchedValues.bank?.accountNumber &&
      watchedValues.bank?.ifscSwift &&
      profileData?.bank.verified
    );

    const docs = profileData?.documents;
    const docsUploadedCount = docs
      ? [
          docs.gstCertificate,
          docs.panCard,
          docs.businessRegistration,
          docs.msmeCertificate,
          docs.cancelledCheque,
        ].filter(Boolean).length
      : 0;

    const documentsValid = docsUploadedCount >= 3;

    return [
      { id: 'company', label: 'Company Information', completed: companyInfoValid },
      { id: 'contact', label: 'Contact Information', completed: contactInfoValid },
      { id: 'gst', label: 'GST Details & Certificate', completed: gstDetailsValid },
      { id: 'bank', label: 'Bank Details Verified', completed: bankDetailsValid },
      { id: 'documents', label: 'Required Business Documents', completed: documentsValid, detail: `${docsUploadedCount}/5 core files` },
    ];
  }, [watchedValues, profileData]);

  const completionPercentage = React.useMemo(() => {
    if (checklist.length === 0) return 0;
    const completedCount = checklist.filter((item) => item.completed).length;
    return Math.round((completedCount / checklist.length) * 100);
  }, [checklist]);

  // --- ACTIONS HANDLERS ---

  const handleRefresh = async () => {
    toast({
      title: 'Refreshing',
      description: 'Fetching profile data...',
      variant: 'default',
    });
    await Promise.all([refetchProfile(), refetchKpis()]);
    toast({
      title: 'Profile Updated',
      description: 'Profile dashboard is up to date.',
      variant: 'success',
    });
  };

  const handleSaveProfile = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const handleDownloadProfile = () => {
    if (!profileData) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vendor_profile_${profileData.company.vendorId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast({
      title: 'Profile Exported',
      description: 'JSON metadata profile downloaded successfully.',
      variant: 'success',
    });
  };

  const handleVerifyBank = () => {
    setIsVerifyingBank(true);
    verifyBankMutation.mutate();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docType: keyof VendorProfile['documents']) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingDocType(docType);
      uploadDocMutation.mutate({ docType, fileName: file.name });
    }
  };

  const handleDownloadDocFile = (docName: string) => {
    const textBlob = new Blob([`Mock certified content of: ${docName}`], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(textBlob);
    const element = document.createElement('a');
    element.href = downloadUrl;
    element.download = docName;
    document.body.appendChild(element);
    element.click();
    element.remove();
    toast({
      title: 'Document Saved',
      description: `Downloaded ${docName} to your local files.`,
      variant: 'success',
    });
  };

  const handlePasswordSubmit = (values: PasswordChangeValues) => {
    vendorProfileService.changePassword(values.currentPassword, values.newPassword).then(() => {
      toast({
        title: 'Credentials Updated',
        description: 'Your portal password was successfully updated.',
        variant: 'success',
      });
      resetPassword();
      refetchProfile();
    });
  };

  const handleToggle2FA = () => {
    setIsTwoFactorModalOpen(true);
  };

  const confirmToggle2FA = () => {
    if (!profileData) return;
    const nextState = !profileData.security.twoFactorEnabled;
    updateProfileMutation.mutate({
      security: {
        ...profileData.security,
        twoFactorEnabled: nextState,
      },
    });
    setIsTwoFactorModalOpen(false);
    toast({
      title: nextState ? '2FA Enabled' : '2FA Disabled',
      description: nextState ? 'Two-Factor authentication is active.' : 'Two-Factor authentication was deactivated.',
      variant: nextState ? 'success' : 'warning',
    });
  };

  // --- LOADING SKELETON STATE ---
  if (isProfileLoading) {
    return (
      <div className={`space-y-6 ${theme === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 dark:bg-slate-800" />
            <Skeleton className="h-4 w-96 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 dark:bg-slate-800" />
            <Skeleton className="h-9 w-20 dark:bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full dark:bg-slate-800" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 dark:bg-slate-800" />
                    <Skeleton className="h-4 w-24 dark:bg-slate-800" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-80 w-full dark:bg-slate-800" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60 w-full dark:bg-slate-800" />
            <Skeleton className="h-60 w-full dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  const businessTypes = [
    { value: 'Proprietorship', label: 'Proprietorship' },
    { value: 'Partnership', label: 'Partnership' },
    { value: 'Private Limited', label: 'Private Limited' },
    { value: 'Public Limited', label: 'Public Limited' },
    { value: 'LLP', label: 'Limited Liability Partnership' },
  ];

  return (
    <div className={`space-y-6 transition-all duration-300 ${theme === 'dark' ? 'dark text-slate-100' : 'text-slate-900'}`}>
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Vendor Profile
            </h1>
            <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full ${isEditing ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
              {isEditing ? 'Editing Mode' : 'View Mode'}
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage your company information, contact details, banking information, and business documents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Light/Dark Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9 p-0 rounded-full border-slate-200 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-9 w-9 p-0 rounded-full border-slate-200 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
            title="Refresh Details"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Export Profile Details */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadProfile}
            className="text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Download Profile
          </Button>

          {/* Edit / Save Actions */}
          {!isEditing ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                toast({
                  title: 'Edit Mode Enabled',
                  description: 'All profile inputs are now editable.',
                  variant: 'default',
                });
              }}
              className="text-xs font-semibold gap-1.5"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  if (profileData) {
                    reset({
                      company: profileData.company,
                      contact: profileData.contact,
                      address: profileData.address,
                      bank: profileData.bank,
                    });
                  }
                  toast({
                    title: 'Editing Cancelled',
                    description: 'Changes discarded.',
                    variant: 'info',
                  });
                }}
                className="text-xs font-semibold dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit(handleSaveProfile)}
                disabled={updateProfileMutation.isPending || !isValid}
                className="text-xs font-semibold gap-1.5"
              >
                {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PROFILE OVERVIEW CARD */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl overflow-hidden transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Logo & Core info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative group">
                <div className="h-20 w-20 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md overflow-hidden">
                  {profileData?.documents.companyLogo ? (
                    <div className="h-full w-full flex flex-col justify-center items-center bg-slate-900/10">
                      <Building2 className="h-8 w-8 text-white" />
                      <span className="text-[8px] font-semibold mt-0.5 tracking-tight uppercase">APEX</span>
                    </div>
                  ) : (
                    'AP'
                  )}
                </div>
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center cursor-pointer transition-opacity text-white text-xs gap-1">
                  <Upload className="h-3 w-3" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'companyLogo')}
                  />
                  Logo
                </label>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {profileData?.company.companyName}
                  </h2>
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/20 dark:text-emerald-300">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Verified Partner
                  </span>
                </div>
                
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Vendor ID: <span className="font-mono text-slate-800 dark:text-slate-200">{profileData?.company.vendorId}</span>
                </p>

                <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {profileData?.company.businessType}
                  </span>
                  <span>•</span>
                  <span>Registered: {profileData?.company.taxRegistrationNumber ? 'Jan 15, 2026' : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Right: Completion stats */}
            <div className="lg:max-w-xs w-full space-y-2 border-t lg:border-t-0 lg:border-l border-slate-150 dark:border-slate-800 pt-4 lg:pt-0 lg:pl-8">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
                <span>Profile Completion</span>
                <span className="text-brand-600 dark:text-brand-400">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {completionPercentage < 100 
                  ? 'Complete your banking, document vault & details to unlock higher RFP limits.'
                  : 'Perfect! Your vendor profile is 100% complete.'}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isKpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="dark:bg-slate-900 dark:border-slate-800">
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2 dark:bg-slate-800" />
                <Skeleton className="h-8 w-12 dark:bg-slate-800" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active RFQs</span>
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {kpis?.activeRFQs}
                  </span>
                  <span className="text-xs text-slate-500">assigned bids</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quotations</span>
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {kpis?.submittedQuotations}
                  </span>
                  <span className="text-xs text-slate-500">submitted proposals</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Purchase Orders</span>
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {kpis?.activePOs}
                  </span>
                  <span className="text-xs text-slate-500">active commitments</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Invoices</span>
                  <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {kpis?.outstandingInvoices}
                  </span>
                  <span className="text-xs text-slate-500">awaiting settlement</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: TABS & EDITABLE FORMS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TABS SELECTOR */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <nav className="flex flex-wrap -mb-px gap-6" aria-label="Tabs">
              {[
                { id: 'company', label: 'Company Info', icon: Building2 },
                { id: 'contact', label: 'Contact Person', icon: User },
                { id: 'address-bank', label: 'Address & Banking', icon: Landmark },
                { id: 'documents', label: 'Business Documents', icon: FileText },
                { id: 'security', label: 'Security & Settings', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-4 px-1 flex items-center gap-2 border-b-2 font-semibold text-sm transition-all duration-200 ${
                      isActive
                        ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit(handleSaveProfile)} className="space-y-6">
            
            {/* TAB CONTENT: COMPANY INFO */}
            {activeTab === 'company' && (
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                    <Building2 className="h-4 w-4 text-brand-600" />
                    Company Registration & Details
                  </CardTitle>
                  <CardDescription>
                    Provide legal business details, tax identity credentials, and primary communication emails.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Company Name"
                      disabled={!isEditing}
                      error={errors.company?.companyName?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.companyName')}
                    />

                    <Input
                      label="Legal Business Name"
                      disabled={!isEditing}
                      error={errors.company?.legalBusinessName?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.legalBusinessName')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Vendor ID"
                      disabled={true} // Vendor ID is always read-only
                      className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-slate-200 dark:border-slate-800"
                      {...register('company.vendorId')}
                    />

                    <Select
                      label="Business Type"
                      disabled={!isEditing}
                      options={businessTypes}
                      error={errors.company?.businessType?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.businessType')}
                    />

                    <Input
                      label="GST Number"
                      disabled={!isEditing}
                      placeholder="e.g. 27AAAAA1111A1Z1"
                      error={errors.company?.gstNumber?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.gstNumber')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="PAN Number"
                      disabled={!isEditing}
                      placeholder="e.g. AAAAA1111A"
                      error={errors.company?.panNumber?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.panNumber')}
                    />

                    <Input
                      label="Tax Registration Number"
                      disabled={!isEditing}
                      error={errors.company?.taxRegistrationNumber?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.taxRegistrationNumber')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Website URL"
                      disabled={!isEditing}
                      placeholder="https://example.com"
                      error={errors.company?.website?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.website')}
                    />

                    <Input
                      label="Business Email"
                      disabled={!isEditing}
                      error={errors.company?.email?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.email')}
                    />

                    <Input
                      label="Phone Number"
                      disabled={!isEditing}
                      error={errors.company?.phone?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.phone')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="Alternate Phone (Optional)"
                      disabled={!isEditing}
                      error={errors.company?.alternatePhone?.message}
                      className="dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
                      {...register('company.alternatePhone')}
                    />

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Business Description
                      </label>
                      <textarea
                        disabled={!isEditing}
                        rows={3}
                        className={`flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100 ${
                          errors.company?.description ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        {...register('company.description')}
                      />
                      {errors.company?.description && (
                        <p className="mt-1 text-xs text-red-600">{errors.company.description.message}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT: CONTACT PERSON */}
            {activeTab === 'contact' && (
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                    <User className="h-4 w-4 text-brand-600" />
                    Primary Contact Representative
                  </CardTitle>
                  <CardDescription>
                    Designate a key executive for purchase order confirmations and RFQ updates.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Primary Contact Name"
                      disabled={!isEditing}
                      error={errors.contact?.primaryContact?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...register('contact.primaryContact')}
                    />

                    <Input
                      label="Job Title"
                      disabled={!isEditing}
                      error={errors.contact?.jobTitle?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...register('contact.jobTitle')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Representative Email"
                      disabled={!isEditing}
                      error={errors.contact?.email?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...register('contact.email')}
                    />

                    <Input
                      label="Desk Phone"
                      disabled={!isEditing}
                      error={errors.contact?.phone?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...register('contact.phone')}
                    />

                    <Input
                      label="Mobile Number"
                      disabled={!isEditing}
                      error={errors.contact?.mobile?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...register('contact.mobile')}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* TAB CONTENT: ADDRESS & BANKING */}
            {activeTab === 'address-bank' && (
              <div className="space-y-6">
                
                {/* ADDRESS SECTION */}
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                      <MapPin className="h-4 w-4 text-brand-600" />
                      Physical Address Details
                    </CardTitle>
                    <CardDescription>
                      Registered address for tax invoices and logistical delivery destinations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Address Line 1"
                        disabled={!isEditing}
                        error={errors.address?.addressLine1?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.addressLine1')}
                      />

                      <Input
                        label="Address Line 2 (Optional)"
                        disabled={!isEditing}
                        error={errors.address?.addressLine2?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.addressLine2')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Input
                        label="City"
                        disabled={!isEditing}
                        error={errors.address?.city?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.city')}
                      />

                      <Input
                        label="State"
                        disabled={!isEditing}
                        error={errors.address?.state?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.state')}
                      />

                      <Input
                        label="Country"
                        disabled={!isEditing}
                        error={errors.address?.country?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.country')}
                      />

                      <Input
                        label="Postal Code"
                        disabled={!isEditing}
                        placeholder="e.g. 411057"
                        error={errors.address?.postalCode?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('address.postalCode')}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* BANK DETAILS SECTION */}
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                        <Landmark className="h-4 w-4 text-brand-600" />
                        Remittance & Banking Account
                      </CardTitle>
                      <CardDescription>
                        Remittance bank records for automated vendor settlement checks.
                      </CardDescription>
                    </div>
                    {profileData?.bank.verified ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-full ring-1 ring-emerald-250">
                        <ShieldCheck className="h-4 w-4" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full ring-1 ring-amber-250">
                        <AlertCircle className="h-4 w-4" /> Unverified
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Bank Name"
                        disabled={!isEditing}
                        error={errors.bank?.bankName?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.bankName')}
                      />

                      <Input
                        label="Account Holder Name"
                        disabled={!isEditing}
                        error={errors.bank?.accountHolder?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.accountHolder')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Account Number"
                        disabled={!isEditing}
                        error={errors.bank?.accountNumber?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.accountNumber')}
                      />

                      <Input
                        label="IFSC / SWIFT Code"
                        disabled={!isEditing}
                        placeholder="e.g. HDFC0000104"
                        error={errors.bank?.ifscSwift?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.ifscSwift')}
                      />

                      <Input
                        label="Branch Name"
                        disabled={!isEditing}
                        error={errors.bank?.branch?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.branch')}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                      <Input
                        label="UPI ID (Optional)"
                        disabled={!isEditing}
                        placeholder="e.g. company@bank"
                        error={errors.bank?.upiId?.message}
                        className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                        {...register('bank.upiId')}
                      />

                      <div className="pt-2">
                        <Button
                          type="button"
                          variant={profileData?.bank.verified ? "ghost" : "outline"}
                          disabled={profileData?.bank.verified || isVerifyingBank}
                          onClick={handleVerifyBank}
                          className="w-full text-xs font-semibold gap-1.5 dark:border-slate-850 dark:hover:bg-slate-800"
                        >
                          {isVerifyingBank ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" /> Verifying Bank...
                            </>
                          ) : profileData?.bank.verified ? (
                            <>
                              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Bank Verified
                            </>
                          ) : (
                            'Verify Bank Account'
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

          </form>

          {/* TAB CONTENT: BUSINESS DOCUMENTS (VAULT) */}
          {activeTab === 'documents' && (
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                  <FileText className="h-4 w-4 text-brand-600" />
                  Audit Document Vault
                </CardTitle>
                <CardDescription>
                  Upload scanned duplicates of tax registration certificates, bank cancellation drafts, and compliance audits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Checking Empty State */}
                {Object.values(profileData?.documents || {}).filter(Boolean).length === 0 ? (
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Upload your business documents</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Provide GST certificates, MSME classifications, and corporate registrations to satisfy regulatory audits.
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById('gst-upload-trigger');
                          input?.click();
                        }}
                        className="text-xs font-semibold gap-1.5"
                      >
                        <Upload className="h-4 w-4" /> Upload First Document
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                          <th className="pb-3 pr-4">Document Type</th>
                          <th className="pb-3 px-4">Filename</th>
                          <th className="pb-3 px-4">Uploaded Date</th>
                          <th className="pb-3 px-4">Registry Status</th>
                          <th className="pb-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {[
                          { key: 'gstCertificate', label: 'GST Certificate' },
                          { key: 'panCard', label: 'PAN Card Copy' },
                          { key: 'businessRegistration', label: 'Business Registration' },
                          { key: 'msmeCertificate', label: 'MSME Certificate' },
                          { key: 'isoCertificate', label: 'ISO Certificate' },
                          { key: 'cancelledCheque', label: 'Cancelled Cheque' },
                          { key: 'companyLogo', label: 'Company Logo' },
                        ].map((doc) => {
                          const fileObj = profileData?.documents[doc.key as keyof VendorProfile['documents']];
                          const inputId = `file-${doc.key}`;

                          return (
                            <tr key={doc.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                              <td className="py-3.5 pr-4 font-semibold text-slate-800 dark:text-slate-350">{doc.label}</td>
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                                {fileObj ? fileObj.name : <span className="text-slate-400 italic">Not Uploaded</span>}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                                {fileObj ? fileObj.uploadDate : '—'}
                              </td>
                              <td className="py-3.5 px-4">
                                {fileObj ? (
                                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                    fileObj.status === 'verified' 
                                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                                  }`}>
                                    {fileObj.status}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 text-[10px] font-bold uppercase">
                                    Missing
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 pl-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <input
                                    id={inputId}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, doc.key as any)}
                                  />

                                  {/* View Doc */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!fileObj}
                                    className="h-8 w-8 p-0 rounded-full dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700"
                                    title="View Document"
                                    onClick={() => setViewingDoc({ type: doc.label, name: fileObj?.name || '' })}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>

                                  {/* Download Doc */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!fileObj}
                                    className="h-8 w-8 p-0 rounded-full dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700"
                                    title="Download Document"
                                    onClick={() => handleDownloadDocFile(fileObj?.name || '')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>

                                  {/* Replace / Upload */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full dark:hover:bg-slate-800 text-brand-600 hover:text-brand-800"
                                    title={fileObj ? "Replace Document" : "Upload Document"}
                                    onClick={() => document.getElementById(inputId)?.click()}
                                  >
                                    {isUploadingDocType === doc.key ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Upload className="h-4 w-4" />
                                    )}
                                  </Button>

                                  {/* Delete Doc */}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!fileObj}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
                                    title="Delete Document"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete the uploaded ${doc.label}?`)) {
                                        deleteDocMutation.mutate(doc.key as any);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

              </CardContent>
            </Card>
          )}

          {/* TAB CONTENT: SECURITY & PREFERENCES */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* NOTIFICATION PREFERENCES */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                    <Bell className="h-4 w-4 text-brand-600" />
                    Notification Delivery Settings
                  </CardTitle>
                  <CardDescription>
                    Select preferred communication gateways for RFQs, quotation triggers, and invoice payments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Alerts', desc: 'Send core invoice and order notifications directly to business email' },
                    { key: 'smsNotifications', label: 'SMS Carrier Alerts', desc: 'Forward critical PO releases to verified contact mobiles' },
                    { key: 'orderUpdates', label: 'Purchase Order Updates', desc: 'Alert when procurement managers release or amend PO releases' },
                    { key: 'quotationUpdates', label: 'RFQ & Bid Updates', desc: 'Send triggers when new RFQs are published' },
                    { key: 'invoiceUpdates', label: 'Invoice Settlement Updates', desc: 'Receive confirmations upon successful payment credit audits' },
                    { key: 'marketingEmails', label: 'Platform Announcements', desc: 'Occasional circulars containing ERP upgrades and partner invites' }
                  ].map((preference) => {
                    const isChecked = !!(profileData?.preferences[preference.key as keyof typeof profileData.preferences]);
                    return (
                      <div key={preference.key} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/40 last:border-0">
                        <div className="space-y-0.5">
                          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {preference.label}
                          </label>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{preference.desc}</p>
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!profileData) return;
                              updateProfileMutation.mutate({
                                preferences: {
                                  ...profileData.preferences,
                                  [preference.key]: !isChecked
                                }
                              });
                            }}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isChecked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isChecked ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* PASSWORD CHANGE */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                    <Key className="h-4 w-4 text-brand-600" />
                    Change Portal Password
                  </CardTitle>
                  <CardDescription>
                    Cycle your authentication passwords regularly to satisfy corporate governance rules.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="password"
                      label="Current Password"
                      error={passwordErrors.currentPassword?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...registerPassword('currentPassword')}
                    />

                    <Input
                      type="password"
                      label="New Password"
                      error={passwordErrors.newPassword?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...registerPassword('newPassword')}
                    />

                    <Input
                      type="password"
                      label="Confirm New Password"
                      error={passwordErrors.confirmPassword?.message}
                      className="dark:bg-slate-955 dark:border-slate-800 dark:text-slate-100"
                      {...registerPassword('confirmPassword')}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end bg-slate-50/50 dark:bg-slate-800/10 p-4">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitPassword(handlePasswordSubmit)}
                    className="text-xs font-semibold"
                  >
                    Change Password
                  </Button>
                </CardFooter>
              </Card>

              {/* SECURITY STATS & 2FA */}
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2 dark:text-slate-100">
                    <ShieldCheck className="h-4 w-4 text-brand-600" />
                    Identity Audits & MFA
                  </CardTitle>
                  <CardDescription>
                    Configure two-factor protocols and audit active session credentials.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Two Factor Switch */}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication (2FA)</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Adds an extra layer of registry safety by prompting for code checks on login attempts.
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleToggle2FA}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          profileData?.security.twoFactorEnabled ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            profileData?.security.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h5 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Last Login Audit</h5>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                        {profileData?.security.lastLogin 
                          ? new Date(profileData.security.lastLogin).toLocaleString() 
                          : 'Unknown'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h5 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Recent Devices</h5>
                      <ul className="text-xs text-slate-700 dark:text-slate-350 space-y-1 font-semibold list-disc list-inside">
                        {profileData?.security.recentDevices.map((device, idx) => (
                          <li key={idx}>{device}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </CardContent>
              </Card>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: TIMELINES & CHECKLIST SIDEBARS */}
        <div className="space-y-6">
          
          {/* PROFILE COMPLETION CHECKLIST */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Completion Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`p-0.5 rounded-full mt-0.5 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-rose-50 text-rose-500 dark:bg-rose-950/20 dark:text-rose-400'
                  }`}>
                    {item.completed ? <Check className="h-4.5 w-4.5" /> : <AlertCircle className="h-4.5 w-4.5" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold ${item.completed ? 'text-slate-700 dark:text-slate-300' : 'text-rose-700 dark:text-rose-400 font-bold'}`}>
                      {item.label}
                    </h4>
                    {item.detail && <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.detail}</p>}
                    {!item.completed && (
                      <p className="text-[10px] text-rose-500 mt-0.5">
                        {item.id === 'gst' && 'Requires GSTIN and file upload.'}
                        {item.id === 'bank' && 'Requires bank entry verification.'}
                        {item.id === 'documents' && 'Upload at least 3 company certificates.'}
                        {item.id === 'company' && 'Mandatory company description fields.'}
                        {item.id === 'contact' && 'Job title and mobile details.'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* RECENT ACTIVITY TIMELINE */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flow-root">
                <ul className="-mb-8">
                  {profileData?.recentActivity.slice(0, 5).map((activity, actIdx) => {
                    const isLast = actIdx === 4 || actIdx === profileData.recentActivity.length - 1;
                    return (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {!isLast && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 text-slate-500">
                                <Clock className="h-4 w-4 text-brand-600" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {activity.action}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {activity.detail}
                              </p>
                              <span className="text-[9px] text-slate-450 mt-1 block">
                                {new Date(activity.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Portal Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 pt-2">
              {[
                { label: 'View Assigned RFQs', href: '/vendor/rfqs' },
                { label: 'Review My Quotations', href: '/vendor/quotations' },
                { label: 'Audit Purchase Orders', href: '/vendor/purchase-orders' },
                { label: 'Issue Invoice Drafts', href: '/vendor/invoices' },
                { label: 'Get Sourcing Support', href: '#', external: true }
              ].map((action, idx) => (
                <a
                  key={idx}
                  href={action.href}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-brand-200 dark:border-slate-850 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-850/20 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    {action.label}
                  </span>
                  {action.external ? <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> : null}
                </a>
              ))}
            </CardContent>
          </Card>

        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <Dialog
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={`Document Preview - ${viewingDoc?.type}`}
        description="Encrypted vendor registration document details"
        size="md"
        footer={
          <Button variant="outline" size="sm" onClick={() => setViewingDoc(null)} className="dark:border-slate-850">
            Close Viewer
          </Button>
        }
      >
        {viewingDoc && (
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-lg border border-slate-200 dark:border-slate-850 text-center font-mono">
            <FileText className="h-16 w-16 mx-auto mb-4 text-brand-600 animate-pulse" />
            <h3 className="text-sm font-semibold mb-2 text-slate-850 dark:text-slate-200">{viewingDoc.name}</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mb-4">
              Simulated PDF preview. Registry signatures verified and compliant.
            </p>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-left text-[11px] text-slate-500 space-y-1">
              <p><strong>Registry Hash (SHA256):</strong> c39b4bca4e650dfb6c6bbf8db5e905e3f438a1bb40212f4581f1cd9391ab1a12</p>
              <p><strong>Uploaded Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Tax Verification Audit Code:</strong> STATUS_OK (0x992B)</p>
            </div>
          </div>
        )}
      </Dialog>

      {/* MULTI-FACTOR AUTHENTICATION CONFIRMATION MODAL */}
      <Dialog
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        title={profileData?.security.twoFactorEnabled ? "Deactivate Two-Factor?" : "Enable Two-Factor Authentication?"}
        description="Registry identity credentials safety confirm"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsTwoFactorModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={confirmToggle2FA}>
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-650 dark:text-slate-450 leading-relaxed">
            {profileData?.security.twoFactorEnabled 
              ? "Disabling Multi-Factor Authentication will reduce your portal credentials security status. You will no longer be prompted for one-time code requests upon login."
              : "Enabling Multi-Factor protocols will secure your procurement contract records. Next time you authenticate, you must satisfy an MFA authenticator code prompt."}
          </p>
        </div>
      </Dialog>

    </div>
  );
}
