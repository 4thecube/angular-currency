import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {
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
        categories: this.date,
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: any;
  currency = [
    { id: 1, value: 'RUB' },
    { id: 2, value: 'USD' },
    { id: 3, value: 'EUR' },
    { id: 4, value: 'PLN' },
  ];
  selectedCurrency = 'USD';
  data: any = [];
  date: any = [];
  value: any = [];
  title = 'angular-chart';

  update(event: Event) {
    this.selectedCurrency = (<HTMLSelectElement>event?.target).value;
    console.log(this.selectedCurrency);
    this.data = [];
    this.value = [];
    this.getData().then(() => {
      setTimeout(() => {
        this.chart?.updateSeries([
          {
            data: this.value,
            name: this.selectedCurrency,
          },
        ]);
        console.log(this.value);
      }, 500);
    });
    console.log('I have being called');
  }

  async getData() {
    let currentMonth = new Date(Date.now()).getMonth() + 1;
    let currentYear = new Date(Date.now()).getFullYear();
    let endDate = new Date(Date.now()).getDate();
    let calledArray = [];
    for (let i = 1; i <= endDate; i++) {
      const call = this.http.get(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${this.selectedCurrency}&date=202109${i}&json`
      );
      this.date.push(`${i}/${currentMonth}/${currentYear}`);
      calledArray.push(call);
    }
    forkJoin([...calledArray]).subscribe((response: any) => {
      this.data.push(...response.flat());
      this.data.forEach((el: any) => {
        return this.value.push(el.rate);
      });
    });
  }
}
