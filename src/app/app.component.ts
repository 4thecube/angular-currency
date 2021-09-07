import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  public chartOptions: any;
  currency = [
    { id: 1, value: 'UAH' },
    { id: 2, value: 'RUB' },
    { id: 3, value: 'USD' },
    { id: 4, value: 'EUR' },
    { id: 5, value: 'PLN' },
  ];
  selectedCurrency = 'UAH';
  constructor(private http: HttpClient) {
    this.chartOptions = {
      series: [
        {
          name: 'series1',
          data: this.value,
        },
      ],
      chart: {
        height: 350,
        type: 'area',
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: this.date,
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }
  data: any = [];
  date: any = [];
  value: any = [];
  title = 'angular-chart';

  update() {
    console.log(this.selectedCurrency);
  }

  getData() {
    let currentMonth = new Date(Date.now()).getMonth() + 1;
    let currentYear = new Date(Date.now()).getFullYear();
    let endDate = new Date(Date.now()).getDate();

    let calledArray = [];

    for (let i = 1; i <= endDate; i++) {
      const call = this.http.get(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=EUR&date=202009${i}&json`
      );
      this.date.push(`${i}/${currentMonth}/${currentYear}`);
      calledArray.push(call);
    }
    const arr = forkJoin([...calledArray]).subscribe((response: any) => {
      this.data.push(...response.flat());
      this.data.forEach((el: any) => {
        return this.value.push(el.rate);
      });
    });
  }

  ngOnInit() {
    this.getData();
  }
}
