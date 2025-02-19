export interface UserProfile {
  userGuid: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tenantGuid: string;
  userTypeHeaderCode: string;
  userTypeValueCode: string;
  accessType: string | null;
  employerName?: string|null;
  employerSchedulingFormId?: string|null;
}
export interface ApplicationInstance {
  applicationInstanceId: number;
  applicationName: string;
  applicationInstanceGuid: string;
  applicationGuid: string;
  applicationIdentifier: string;
  createdAt: Date | number;
  createdAtFormatted?: string;
}
export interface MatchedCandidate {
  matchedCandidateGuid: string;
  candidateUserGuid: string;
  employerGuid: string;
  candidateSalutation: string | null;
  candidateFirstName: string;
  candidateLastName: string;
  candidateCountry: string;
  matchScore: number | null;
  resumeBlobStorageURL: string | null;
  statusValueCode: string;
  documentGuid: string;
  candidateEmail: string;
  displayLabel: string | null;
  isInterviewLinkSent: boolean;
}
export interface Interview {
  upcomingInterviewsGuid: string;
  employerGuid: string;
  matchedCandidatesGuid: string;
  interviewStartDateTime: string;
  interviewEndDateTime: string;
  joiningUrl: string;
  created: string;
  matchedCandidateCountry: string;
  matchedCandidateFirstName: string;
  matchedCandidateLastName: string;
  timeZone: string;
}
export interface Employer {
  employerGuid: string;
  employerName: string;
  signUpDate: string;
  calendlyBookingLink: string;
  schedulingFormId?: string | null;
  activeUsers: string | null;
}
export interface AddInterview {
  upcomingInterviewGuid: string | null;
  matchedCandidatesGuid: string | null;
  interviewStartDateTime: string;
  interviewEndDateTime: string;
  joiningUrl: string;
  employerGuid: string | null;
  timeZone?: string | null;
}
export interface Application {
  applicationName: string;
  applicationGuid: string | null;
  applicationDescription: string;
  applicationCountry: string;
  destinationCountry: string | null;
  headerBanner: string | null;
  action: string | null;
  userObjective: string | null;
  applicationSteps: ApplicationStep[] | null;
}
export interface NewApplication {
  applicationGuid?: string | null;
  applicationName: string;
  headerBanner: string | null;
  applicationDescription: string;
  applicationCountry: string;
  destinationCountry: string | null;
  tenantGuid: string | null;
}
export interface ApplicationStep {
  applicationStepGuid?: string;
  applicationStepName: string;
  applicationStepOrder: number;
  tenantGuid?: string;
  applicationGuid: string;
  applicationInstanceGuid?:string|null;
  created?: string | Date;
  modified?: string | null;
  instanceCreated?: string | Date;
  instanceCompleted?: string | null;
  instanceRejected?: string | null;
  stepStatus?: string | null;
  applicationInstanceStepGuid?: string | null;
  applicationStepTypeValueCode: string | null;
  }

export interface UserDetails {
  userGuid: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tenantGuid: string;
  userTypeHeaderCode: string;
  userTypeValueCode: string;
}

export interface EmployerUser {
  employerUserGuid: string;
  userGuid: string;
  employerGuid: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tenantGuid: string;
  userTypeHeaderCode: string;
  userTypeValueCode: string;
  accessType: string;
}
export interface AutoFillRequest {
  webFormInstanceId: string;
  autofillValue: string;
  webFormGuid: string;
}

export interface Applicant {
  userGuid: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  countryOfNationality: string;
}

export interface ApplicationInstancesDetails {
  applicationInstanceGuid: string;
  applicationDetails: Application;
}
export interface Invite {
  employerUserInviteGuid?: string;
  employerName?: string;
  firstName: string;
  lastName: string | null;
  email: string;
  accessType: string;
  employerGuid?:string|null;
}
export interface WebForm{
  webFormGuid:string;
  webFormName:string;
  
  }
  export interface DocumentType{
  documentTypeDescription:string;
  documentTypeGuid:string;
  documentTypeName:string;
  }
export interface DocumentRequest {
  documentRequestGuid: string;
  requestToken: string;
  receiverFirstName: string;
  receiverLastName: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverUserId: string;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
  created: string | Date;
  createdByUserId: string;
}

export interface DocumentRequestActivity {
  documentRequestActivityGuid: string;
  documentRequestGuid: string;
  activityDateTime: string | Date;
  activityTypeHeaderCode: string;
  activityTypeValueCode: string;
}

export interface DocumentRequestDocument {
  documentRequestDocumentsGuid: string;
  documentRequestGuid: string;
  documentTypeGuid: string;
  documentTypeName: string;
  approvedDate: string | Date;
  blobStorageIdentifier: string;
}

export interface GetAllDocumentRequestResponse {
  requests: DocumentRequest;
  activities: DocumentRequestActivity[];
  documents: DocumentRequestDocument[];
}

export interface DocumentRequestTable {
  documentRequestGuid: string;
  receiverFirstName: string;
  receiverLastName: string;
  receiverEmail: string;
  receiverPhone: string;
  created: string | Date;
  receiverFullName: string;
  receiverUserId: string;
}

export interface DocumentType {
  documentTypeGuid: string;
  documentTypeName: string;
  documentTypeDescription: string;
}

export interface DocumentTypeForRequestBody {
  documentTypeGuid: string;
}

export interface RequestBodyForDocumentRequest {
  RequestToken: string;
  ReceiverFirstName: string;
  ReceiverLastName: string;
  ReceiverEmail: string;
  ReceiverPhone: string;
  SenderFirstName: string;
  SenderLastName: string;
  SenderEmail: string;
  RequestLink: string;
  DocumentTypes: DocumentTypeForRequestBody[];
}

export interface UpdateDocumentRequestStatus {
  documentRequestGuid: string;
  documentRequestActivityGuid: string;
  documentRequestDocumentsGuid: string;
  status: StatusUpdate;
  rejectionReason?: string;
}

export interface StatusUpdate {
  approve: boolean;
  reject: boolean;
  reapply: boolean;
}
