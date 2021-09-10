import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;
  public chartOptions: any;
  currency = [
    { id: 1, value: 'RUB' },
    { id: 2, value: 'USD' },
    { id: 3, value: 'EUR' },
    { id: 4, value: 'PLN' },
  ];
  selectedCurrency = 'USD';
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

  data: any = [];
  date: any = [];
  value: any = [];
  title = 'angular-chart';

  update(event: Event) {
    this.selectedCurrency = (<HTMLSelectElement>event.target).value;
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
      }, 500);
    });
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

  ngOnInit() {
    this.getData();
  }
}
