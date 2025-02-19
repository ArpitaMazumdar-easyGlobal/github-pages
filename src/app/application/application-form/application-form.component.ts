import { Component, ElementRef, OnInit, Renderer2 } from "@angular/core";
import { Observable, Subject, takeUntil } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import {
  selectSelectedFormGuid,
  selectWebFormInstanceGuid,
  selectUserId
} from "../../core/session/session.selectors";
import { setWebFormInstanceGuid } from "../../core/session/session.actions";
import { CommonModule, Location } from "@angular/common";
import { ApplicationService } from "../../core/service/application.service";
import { DataService } from "../../core/service/data.service";

declare var Formio: any;

@Component({
  selector: "app-application-form",
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: "./application-form.component.html",
  styleUrl: "./application-form.component.css",
  providers: [DataService, ToastrService, ApplicationService]
})
export class ApplicationFormComponent implements OnInit {
  data = "";
  error = "";
  formid = "ogWShwsBdxus"
  private unsubscribe$ = new Subject<void>();
  private scriptUrl = 'https://server.fillout.com/embed/v1/';
  selectedFormGuid$: Observable<string | null>;
  formSchema: any = {};
  formsteps = [];
  selectedUserId$: Observable<string | null>;
  applicationGuid: string;

  constructor(
    private el: ElementRef,
    private dataService: DataService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private store: Store,
    private location: Location,
    private renderer: Renderer2
  ) {}
  
  body: any = {
    WebFormInstanceGuid: "",
    QuestionsAndAnswers: {},
    ApplicationGuid:""
  };

  ngOnInit(): void {
    this.route.parent.paramMap.subscribe(params => {
      this.applicationGuid = params.get('id');
    });
    this.selectedFormGuid$ = this.store.select(selectSelectedFormGuid);
    this.selectedUserId$ = this.store.select(selectUserId);

    this.selectedFormGuid$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(selectedFormGuid => {
        if (selectedFormGuid != null) {
          const reqBody: any = {}
          this.selectedUserId$
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(selectedUserId => {
              this.dataService.createWebFormInstance(selectedFormGuid, reqBody, "id")
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((webFormInstance: any) => {
                  this.store.dispatch(setWebFormInstanceGuid({
                    webFormInstanceGuid: webFormInstance.webFormInstanceGuid
                  }));
                });
            });
        }
      });
    
    this.loadData();
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.src = this.scriptUrl;
    script.onload = () => {
    }
    script.onerror = () =>{
      console.error('error loading fillout script');
    }
    this.renderer.appendChild(document.body, script);
  }

  loadData(): void {
    this.selectedFormGuid$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(selectedFormGuid => {
        if (!selectedFormGuid || this.unsubscribe$.isStopped) {
          return;
        }

        this.dataService
          .getWebFormJson(selectedFormGuid)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: response => {
              const parsedFormSchema = JSON.parse(response.json);
              this.formSchema = parsedFormSchema;
              // this.createForm();
            },
            error: error => (this.error = error)
          });
      });
  }

  // createForm(): void {
  //   const formElement = this.el.nativeElement.querySelector("#formio");  
  //   if (formElement && this.formSchema) {
  //     console.log(this.formSchema);
  //     this.formsteps = this.formSchema.components[0].components;

  //     Formio.createForm(formElement, this.formSchema)
  //       .then((form: any) => {  
  //         form.on("submit", (submission: any) => {
  //           this.store
  //             .select(selectWebFormInstanceGuid)
  //             .pipe(takeUntil(this.unsubscribe$))
  //             .subscribe(webFormInstance => {
  //               this.body.WebFormInstanceGuid = webFormInstance;
  //               this.body.QuestionsAndAnswers = submission.data;
  //               this.body.ApplicationGuid = this.applicationGuid;
  //               this.dataService.saveWebFormData(this.body).subscribe({
  //                 next: res => {
  //                   console.log("Data Save Successfully ", this.body);
  //                   this.toastr.success("Success", "Data Saved Successfully!", {
  //                     closeButton: true,
  //                     timeOut: 3000
  //                   });
  //                   this.location.back();
  //                 },
  //                 error: err => {
  //                   console.log("Error saving data ", this.body);
  //                   this.toastr.error("Error", "Data Not Saved!", {
  //                     closeButton: true,
  //                     timeOut: 3000
  //                   });
  //                 }
  //               });
  //             });
  //         });
  //       })
  //       .catch((err: any) => console.error("Error creating form:", err));
  //   } else {
  //     console.error("Form element not found or formSchema is undefined");
  //   }
  // }
  
  // Method to go back to forms page
  onBack() {
    this.location.back();
  }

  // Clean up all subscriptions
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
