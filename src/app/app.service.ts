import { Injectable, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
} from 'ng-apexcharts';

import { ICurrency } from './app.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {
    this.chartOptions = {
      series: [
        {
          name: this.selectedCurrency,
          data: this.currencyValue,
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
        categories: this.dateArray,
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
  currencyData: any = [];
  currencyValue: number[] = [];
  startDate: string = '';
  endDate: string = '';
  dateArray: string[] = [];
  streams: Object[] = [];

  clearDataStorage() {
    this.streams = [];
    this.currencyData = [];
    this.currencyValue = [];
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
    let daylist = getDaysArray(
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

  // creating array of streams
  _generatingStreams(dateArray: string[]) {
    for (let i = 0; i < dateArray.length; i++) {
      let stream = this.http.get(
        `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${
          this.selectedCurrency
        }&date=${dateArray[i].split('.')[2]}${dateArray[i].split('.')[1]}${
          dateArray[i].split('.')[0]
        }&json`
      );
      this.streams.push(stream);
    }
  }

  getData() {
    this.clearDataStorage();
    this._generatingStreams(this.dateArray);
    forkJoin([...this.streams]).subscribe((response: any) => {
      this.currencyData.push(...response.flat());
      this.currencyData.forEach((currencyValue: ICurrency) => {
        return this.currencyValue.push(currencyValue.rate);
      });
    });
  }
}
