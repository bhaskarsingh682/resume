//app.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { debounceTime, tap, switchMap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';

const API_KEY = "e8067b53"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  searchResumesCtrl = new FormControl();
  filteredResumes: any;
  isLoading = false;
  errorMsg!: string;
  minLengthTerm = 3;
  selectedResume: any = "";

  constructor(
    private http: HttpClient
  ) { }

  onSelected() {
    console.log(this.selectedResume);
    this.selectedResume = this.selectedResume;
  }

  displayWith(value: any) {
    return value?.Title;
  }

  clearSelection() {
    this.selectedResume = "";
    this.filteredResumes = [];
  }

  ngOnInit() {
    this.searchResumesCtrl.valueChanges
      .pipe(
        filter(res => {
          return res !== null && res.length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.errorMsg = "";
          this.filteredResumes = [];
          this.isLoading = true;
        }),

       
        switchMap(value => this.http.get('http://localhost:3000/resumes?' + 'text=' + value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        console.log(data)
        if (data.hits['hits'] == undefined) {
          this.errorMsg = data['Error'];
          this.filteredResumes = [];
        } else {
          this.errorMsg = "";
          this.filteredResumes = data.hits['hits'];
        }
        console.log(this.filteredResumes);
      });
  }
}