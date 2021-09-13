import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @Input() max: any;
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: any;

  // this is for datepicker
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  startDate: string = '';
  endDate: string = '';
  //dateArray for chart X axis showing
  dateArray: string[] = [];
  currency = [
    { id: 1, value: 'RUB' },
    { id: 2, value: 'USD' },
    { id: 3, value: 'EUR' },
    { id: 4, value: 'PLN' },
  ];
  selectedCurrency = 'USD';
  maxDateForSelect = new Date();
  constructor(private http: HttpClient) {
    this.maxDateForSelect.setDate(this.maxDateForSelect.getDate() + 1);
    // this.maxDateForSelect = new Date(Date.now());
    this.chartOptions = {
      series: [
        {
          name: this.selectedCurrency,
          data: this.value,
        },
      ],
      chart: {
        height: 550,
        type: 'area',
      },
      legend: {
        show: true,
        fontSize: '14px',
        showForSingleSeries: true,
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: this.dateArray,
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }

  data: any = [];
  value: any = [];
  title = 'angular-chart';

  forceChartRerender() {
    setTimeout(() => {
      this.chart?.updateOptions({
        series: [
          {
            data: this.value,
            name: this.selectedCurrency,
          },
        ],
        xaxis: {
          categories: this.dateArray,
        },
        colors: ['#4A0080'],
      });
    }, 500);
  }

  // clearing data storage for preventing data duplication
  clearDataStorage() {
    this.data = [];
    this.value = [];
  }

  updateCurrency(event: Event) {
    this.selectedCurrency = (<HTMLSelectElement>event.target).value;
    this.clearDataStorage();
    this.getData();
    this.forceChartRerender();
  }

  async getData() {
    this.clearDataStorage();
    let apiCalls = [];
    for (let i = 0; i < this.dateArray.length; i++) {
      console.log(this.dateArray[i]);
      const call = this.http.get(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${
          this.selectedCurrency
        }&date=${this.dateArray[i].split('.')[2]}${
          this.dateArray[i].split('.')[1]
        }${this.dateArray[i].split('.')[0]}&json`
      );
      apiCalls.push(call);
    }
    forkJoin([...apiCalls]).subscribe(async (response: any) => {
      await this.data.push(...response.flat());
      await this.data.forEach((el: any) => {
        return this.value.push(el.rate);
      });
    });
    this.forceChartRerender();
  }

  // generating a date range for API call with proper format
  dateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ) {
    this.startDate = dateRangeStart.value;
    this.endDate = dateRangeEnd.value;
    function getDaysArray(start: Date, end: Date) {
      for (
        var arr = [], dt = new Date(start);
        dt <= end;
        dt.setDate(dt.getDate() + 1)
      ) {
        arr.push(new Date(dt));
      }
      return arr;
    }
    var daylist = getDaysArray(
      new Date(this.startDate),
      new Date(this.endDate)
    );
    this.dateArray = daylist.map((v: Date) =>
      v.toLocaleDateString('uk-UK', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      })
    );
  }

  ngOnInit() {
    console.log(this.maxDateForSelect);
  }
}
