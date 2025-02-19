export enum ApiPaths {
    GetAllForms = '/all',
    SaveInstanceAnswer = '/instance_answer',
    CreateInstance = '/instance',
    GetTenant = '/ByTenantDomain',
    CreateHubspotContact = '/Hubspot/Contact',
    CreateWebFormInstanceApplication = '/WebFormInstance_Application',
    GetApplicationDocumentTypes = '/ApplicationInstanceDocuments/applicationdocuments',
    UploadApplicationDocument = '/ApplicationInstanceStepDocuments',
    WebFormInstanceAutofill = '/WebFormInstance_Autofill',
    UpdateDocumentRequestStatus = '/DocumentRequest/DocumentAudit',
    ApproveApplicationInstanceStepDocument = '/ApplicationInstanceStepDocuments/approve',
    RejectApplicationInstanceStepDocument = '/ApplicationInstanceStepDocuments/reject',
    DocumemtRequestDocumentDownload = '/DocumentRequest/FileDownload'
 }