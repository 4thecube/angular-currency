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
  startDate: string = '';
  endDate: string = '';
  dateArray: string[] = [];
  title = 'angular-chart';

  clearDataStorage() {
    this.data = [];
    this.value = [];
  }

  pickDate(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
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

  update(eventTarget: string) {
    this.selectedCurrency = eventTarget;
    this.clearDataStorage();
    this.getData();
  }

  async getData() {
    this.clearDataStorage();
    let apiCalls = [];
    for (let i = 0; i < this.dateArray.length; i++) {
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
  }
}
