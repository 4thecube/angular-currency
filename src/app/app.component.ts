import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { AppService } from './app.service';

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
interface Currency {
  id: number;
  value: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: any;
  // this is for datepicker
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });
  currency: Currency[];
  selectedCurrency: string;

  constructor(private appService: AppService) {
    this.currency = appService.currency;
    this.selectedCurrency = appService.selectedCurrency;
    this.chartOptions = appService.chartOptions;
  }
  // for date-picker
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  forceChartRerender() {
    setTimeout(() => {
      this.chart?.updateOptions({
        series: [
          {
            data: this.appService.value,
            name: this.selectedCurrency,
          },
        ],
        xaxis: {
          categories: this.appService.dateArray,
        },
        dataLabels: {
          enabled: true,
          background: {
            enabled: true,
            foreColor: '#4b0082',
            padding: 8,
            borderRadius: 2,
            borderWidth: 2,
            borderColor: '#4b0082;',
          },
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              colors: '#00e396',
            },
          },
        },
        colors: ['#00e396'],
      });
    }, 900);
  }

  updateCurrency(eventTarget: string) {
    this.appService.update(eventTarget);
    this.forceChartRerender();
  }

  async getData() {
    this.appService.getData();
    this.forceChartRerender();
  }

  // generating a date range for API call with proper format
  dateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ) {
    this.appService.pickDate(dateRangeStart, dateRangeEnd);
  }

  ngOnInit() {}
}
