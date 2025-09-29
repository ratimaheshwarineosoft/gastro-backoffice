import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import ApexCharts from 'apexcharts';

@Component({
  selector: 'app-dashboard',
  imports: [TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  chartIncome!: ApexCharts;
  chartVisitors!: ApexCharts;
  resizeObserver!: ResizeObserver;

  ngOnInit() {}

  ngAfterViewInit(): void {
    // this.initCharts();
    // setTimeout(() => {
    //   window.dispatchEvent(new Event('resize'));
    // }, 100);
  }

  // initCharts(): void {
  //   const incomeOptions: ApexCharts.ApexOptions = {
  //     chart: {
  //       type: 'bar',
  //       toolbar: { show: true },
  //       zoom: { enabled: true },
  //       height: '300',
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     series: [
  //       {
  //         name: 'Chosen Period',
  //         data: [23000, 44000, 55000, 57000, 56000, 61000, 58000, 62000, 59000, 65000, 70000, 75000],
  //       },
  //       {
  //         name: 'Last Period',
  //         data: [18000, 32000, 70000, 83000, 99000, 87000, 86000, 91000, 88000, 93000, 68000, 72000],
  //       },
  //     ],
  //   };
  //   this.chartIncome = new ApexCharts(document.querySelector('#hs-multiple-bar-charts') as HTMLElement, incomeOptions);
  //   this.chartIncome.render();

  //   const visitorOptions: ApexCharts.ApexOptions = {
  //     chart: {
  //       type: 'area',
  //       toolbar: { show: true },
  //       zoom: { enabled: true },
  //       height: '300',
  //     },
  //     series: [
  //       {
  //         name: 'Visitors',
  //         data: [180, 51, 60, 38, 88, 50, 40, 52, 88, 80, 60, 70],
  //       },
  //     ],
  //   };
  //   this.chartVisitors = new ApexCharts(document.querySelector('#hs-single-area-chart') as HTMLElement, visitorOptions);
  //   this.chartVisitors.render();
  // }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
