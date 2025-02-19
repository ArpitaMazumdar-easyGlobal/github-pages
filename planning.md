Configuration Data - This is the structure of the application, how many steps, what each step has
//Application Configuration, Application Step Configuration, WebForm Configuration, Document Configuration
 
Instance Data - This is the data that the user creates
//ApplicationInstance, //ApplicationInstance_Step,
 
Workflow
1) User comes to the Fillout form
2) Based on the fillout form, we determine the applicationtype that the user is interested in and we send a webhook
3) Webhook gets sent to a /api/ApplicationInstance/Create?ApplicationGuid={guid}
4) User gets redirected to the EntryHub Dashboard where they can see a list of all ApplicationInstances in their profile (/api/ApplicationInstance/GetAll)
5) If they decide to go to a specific ApplicationInstance, we take them to the ApplicationInstanceDetail page
6) On this detail page, we need to show the following (/api/ApplicationInstance/Get)
    - All ApplicationSteps
    - Current Step that they are on (This is determined by ApplicationInstanceStep records)
7) We also need to display Details about the current step (Whether it has WebForms or DocumentCollection or Both) (/api/ApplicationStep/Get/{applicationStepGuid})
8) Need a way to store the following -
    - Web Form Answers - Saket to do this
    - Documents uploaded by the User - Udit has an endpoint
    - ApplicationInstanceStep/Progress - ON HOLD
 
 
Endpoints
1) POST /api/ApplicationInstance/Create?ApplicationGuid={guid} - Creates an ApplicationInstance for the current logged in user
2) GET /api/ApplicationInstance/GetAll - Shows the current user all the ApplicationInstances that they have started
Example -
[
    {
    "applicationInstanceGuid": "aeeceea3-8d45-44c3-9857-64f90a485b59",
    "applicationGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "applicationName": "Caregiver Program",
    "applicationDescription": "Caregiver Program Details",
    "applicationCountry": "IN",
    "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "created": "2024-12-11T18:52:56.6395162",
    "createdByUserId": "6750bd089dbe01d9968a4bf9",
    },
    {
    "applicationInstanceGuid": "aeeceea3-8d45-44c3-9857-64f90a485b59",
    "applicationGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "applicationName": "Francophone Program",
    "applicationDescription": "Francophone Program Details",
    "applicationCountry": "IN",
    "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "created": "2024-12-11T18:52:56.6395162",
    "createdByUserId": "6750bd089dbe01d9968a4bf9",
    },
]
3) GET /api/ApplicationInstance/Get/{applicationInstanceGuid}
Example -
{
    "applicationInstanceGuid": "aeeceea3-8d45-44c3-9857-64f90a485b59",
    "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "created": "2024-12-11T18:52:56.6395162",
    "createdByUserId": "6750bd089dbe01d9968a4bf9",
    "currentApplicationStepGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "currentApplicationInstanceStepGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "applicationInstanceSteps": [
        {
            "applicationInstanceStepGuid": "aeeceea3-8d45-44c3-9857-64f90a485b59",
            "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
            "createdByUserId": "6750bd089dbe01d9968a4bf9",
            "created": "2024-12-11T18:52:56.6395162",
            "completedDateTime": null,
        },
        {
            "applicationInstanceStepGuid": "aeeceea3-8d45-44c3-9857-64f90a485b59",
            "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
            "createdByUserId": "6750bd089dbe01d9968a4bf9",
            "created": "2024-12-11T18:52:56.6395162",
            "completedDateTime": null,
        },
    ],
    "application": {
        "applicationGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
        "applicationName": "Caregiver Program",
        "applicationDescription": "Caregiver Program Details",
        "applicationCountry": "IN",
        "applicationSteps": [
            {
                "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
                "applicationStepName": "Application Step 1",
                "applicationStepOrder": 1,
                "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
                "created": "2024-12-11T18:44:33.7630554",
                "modified": null,
                "applicationStepTypeValueCode": "WEBFORM",
            },
            {
                "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
                "applicationStepName": "Application Step 2",
                "applicationStepOrder": 2,
                "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
                "created": "2024-12-11T18:44:33.7630554",
                "modified": null,
                "applicationStepTypeValueCode": "DOCUMENTCOLLECTION",
            },
            {
                "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
                "applicationStepName": "Application Step 3",
                "applicationStepOrder": 3,
                "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
                "created": "2024-12-11T18:44:33.7630554",
                "modified": null,
                "applicationStepTypeValueCode": "INFORMATIONAL",
            }
        ]
    }
}
 
4) GET /api/ApplicationStep/Get/{applicationStepGuid}
Example 1 - In this scenario for this particular step, we will ask the user to fillout two forms and ask for 2 documents
{
    "applicationStepGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
    "applicationStepName": "Application Step 1",
    "applicationStepOrder": 1,
    "tenantGuid": "bf2af141-65db-4d1f-9b67-748bc4d10d39",
    "created": "2024-12-11T18:44:33.7630554",
    "modified": null,
    "applicationStep_webForm": [
        {
            "applicationStep_webFormGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "applicationStep_webFormName": "Form 1",
            "applicationStep_webFormDescription": "Form 1 Description",
            "applicationStep_webFormFilloutEmbedURL": "https://forms.easyglobal.ai/t/some-id",
        },
        {
            "applicationStep_webFormGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "applicationStep_webFormName": "Form 1",
            "applicationStep_webFormDescription": "Form 1 Description",
            "applicationStep_webFormFilloutEmbedURL": "https://forms.easyglobal.ai/t/some-id",
        }
    ],
    "applicationStep_documentCollection": [
        {
            "applicationStep_documentGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "applicationStep_documentName": "Form 1",
            "applicationStep_documentDescription": "Form 1 Description",
            "applicationStep_documentTypeGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
        },
        {
            "applicationStep_documentGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
            "applicationStep_documentName": "Form 1",
            "applicationStep_documentDescription": "Form 1 Description",
            "applicationStep_documentTypeGuid": "6c3bf99f-817d-427b-a747-4dd585d0a71e",
        }
    ],
}
 
5) POST /api/ApplicationStepWebForm/{ApplicationStepWebFormGuid} - Sak to do this
 
Step 1 - Set ApplicationStep
var keyValuePairs = JsonSerializer.Deserialize<Dictionary<string, string>>(body); - to read all the key value pairs of the answers from the request body
 
6) POST /api/Document/Upload - Use the existing endpoint that Udit has
 
7) Determining which step is complete - ON HOLD








----------------------------------------------------------------

Previous flow
Intake form  ------> 
https//localhost:4200?email=useremail?appname ---> 
login (isAuthenticated then get token else login screen) after login redirect to home/caregiver (home/:name) ----> 
home/caregiver
    1. fetching all application
    2. finding the one specified in the query params
    3. then create the application instance for that found app guid
    4. then redirect to application details page

if already logged in redirectes /home or /home/login


New flow
Intake form --->
https//localhost:4200?email=useremail&?applicationGuid -->
login (isAuthenticated then get token else login screen) after login create appinstance for the provided appguid then redirect to /myapplication(Entryhub dashboard) --> 
if user clicks on any application instance take to applicationdetails page (i.e) '/form-manager/:appGuid'


{
    "applicationStepGuid": "0beba196-4d9f-4c75-9de1-df32abf80757",
    "applicationInstanceGuid":""
    "applicationStepName": "Upload Personal Documents",
    "applicationStepOrder": 2,
    "tenantGuid": "b6fcc1f1-2f7f-4adc-9c07-09d06651197d",
    "created": "2024-12-10T19:10:10.6174464",
    "modified": null,
    "applicationStep_webForm": [
        {
            "webFormGuid": "41175976-5df5-463a-b658-8ecdbcd20922",
            "applicationStep_webFormGuid": "d8a5b90e-d77b-42ad-9408-0a1a622cd0d1",
            "applicationStep_webFormName": "Test Eligibility Form",
            "applicationStep_webFormFilloutEmbedURL": "9YoFXSCayrus"
        }
    ],
    "applicationInstanceStep_webFormInstance":[
        {"webinstanceGuid":""
        completedSateTime:"}
    ]
    "applicationStep_documentCollection": [
        {
            "applicationStep_documentGuid": "98e64fea-1de3-462e-bbf5-112cb2bdc530",
            "applicationStep_documentName": "Resume (in Microsoft Word Format)",
            "applicationStep_documentDescription": "Resume (in Microsoft Word Format)",
            "applicationStep_documentTypeGuid": "ab842694-c97e-4c14-91e2-6d590712a768"
        },
        {
            "applicationStep_documentGuid": "d4f6998e-76c2-4f5c-920e-9c4bf5278f0c",
            "applicationStep_documentName": "2 Passport Sized Photographs",
            "applicationStep_documentDescription": "2 Passport Sized Photographs",
            "applicationStep_documentTypeGuid": "0e6bb8c7-ebdd-4e5d-8407-f5add56eddc6"
        }
    ]
}